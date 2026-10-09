import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyWebsocket from '@fastify/websocket';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { hostRoutes } from './routes/host.js';
import { guestRoutes } from './routes/guest.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'keepsake-default-secret-string-change-me-32chars';

// Ensure data/media directory exists
export const MEDIA_DIR = path.resolve(__dirname, '../data/media');
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

export const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  disableRequestLogging: false,
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  if (!body || (typeof body === 'string' && body.trim().length === 0)) {
    done(null, {});
    return;
  }
  try {
    const json = JSON.parse(body as string);
    done(null, json);
  } catch (err: any) {
    done(err, undefined);
  }
});

// Register Plugins
await fastify.register(fastifyCookie, {
  secret: JWT_SECRET,
});

await fastify.register(fastifyJwt, {
  secret: JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },
});

await fastify.register(fastifyRateLimit, {
  global: false,
});

await fastify.register(fastifyWebsocket);

await fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// Static client & media files
const WEB_DIST = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(WEB_DIST)) {
  await fastify.register(fastifyStatic, {
    root: WEB_DIST,
    prefix: '/',
  });
}

// Media files static serving
await fastify.register(fastifyStatic, {
  root: MEDIA_DIR,
  prefix: '/media-files/',
  decorateReply: false,
});

// Connected WebSocket clients
export const connectedGuests = new Map<string, Set<any>>(); // guestId -> Set<WebSocket>
export const connectedHosts = new Set<any>(); // Set<WebSocket>
export const meshSockets = new Map<string, any>(); // peerId -> WebSocket

// Health check endpoint
fastify.get('/api/health', async (_req, reply) => {
  try {
    const result = await db.execute(sql`SELECT 1 as healthy`);
    return {
      status: 'ok',
      db: result.rows.length > 0 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    fastify.log.error(err);
    reply.status(500);
    return { status: 'error', db: 'unreachable', error: err.message };
  }
});

// Register Routes
await fastify.register(hostRoutes);
await fastify.register(guestRoutes);

// WebSocket endpoint
fastify.get('/ws', { websocket: true }, (socket, req) => {
  fastify.log.info({ ip: req.ip }, 'WebSocket client connected');

  // Authenticate socket via cookies
  const cookies = req.headers.cookie
    ? Object.fromEntries(
        req.headers.cookie.split(';').map((c) => {
          const [k, ...v] = c.trim().split('=');
          return [k, decodeURIComponent(v.join('='))];
        })
      )
    : {};

  let authContext: { role: 'host' | 'guest'; guestId?: string } | null = null;

  if (cookies.host_token) {
    try {
      const decoded = fastify.jwt.verify<{ role: string }>(cookies.host_token);
      if (decoded.role === 'host') {
        authContext = { role: 'host' };
        connectedHosts.add(socket);
      }
    } catch {
      // invalid host token
    }
  }

  if (!authContext && cookies.guest_token) {
    try {
      const decoded = fastify.jwt.verify<{ guestId: string; role: string }>(cookies.guest_token);
      if (decoded.guestId) {
        authContext = { role: 'guest', guestId: decoded.guestId };
        if (!connectedGuests.has(decoded.guestId)) {
          connectedGuests.set(decoded.guestId, new Set());
        }
        connectedGuests.get(decoded.guestId)!.add(socket);
      }
    } catch {
      // invalid guest token
    }
  }

  socket.on('message', (message: any, isBinary: boolean) => {
    // Binary preview frame from guest camera: forward to connected host sockets
    if (isBinary && authContext?.role === 'guest' && authContext.guestId) {
      const guestIdBuffer = Buffer.from(authContext.guestId.replace(/-/g, ''), 'hex');
      const payload = Buffer.concat([guestIdBuffer, Buffer.isBuffer(message) ? message : Buffer.from(message)]);
      for (const hostSocket of connectedHosts) {
        if (hostSocket.readyState === 1) {
          hostSocket.send(payload, { binary: true });
        }
      }
      return;
    }

    try {
      const text = message.toString();
      const parsed = JSON.parse(text);

      if (parsed.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        return;
      }

      // Host camera boost control
      if (authContext?.role === 'host' && (parsed.type === 'boost' || parsed.type === 'unboost')) {
        const guestSockets = connectedGuests.get(parsed.guestId);
        if (guestSockets) {
          for (const s of guestSockets) {
            if (s.readyState === 1) {
              s.send(JSON.stringify(parsed));
            }
          }
        }
        return;
      }

      // P2P WebRTC Mesh Signaling Relay: Automatic zero-config handshake
      if (parsed.type === 'join_mesh') {
        const myPeerId = parsed.peerId;
        (socket as any).peerId = myPeerId;
        meshSockets.set(myPeerId, socket);

        // 1. Tell all existing peers about this new peer
        for (const [peerId, peerSocket] of meshSockets) {
          if (peerId !== myPeerId && peerSocket.readyState === 1) {
            peerSocket.send(JSON.stringify({ type: 'peer_joined', peerId: myPeerId }));
          }
        }

        // 2. Tell the new peer about all already connected peers so it connects instantly
        const existingPeers: string[] = [];
        for (const [peerId, peerSocket] of meshSockets) {
          if (peerId !== myPeerId && peerSocket.readyState === 1) {
            existingPeers.push(peerId);
          }
        }
        socket.send(JSON.stringify({ type: 'mesh_peers', peers: existingPeers }));
        return;
      }

      if (parsed.type === 'signal') {
        const targetId = parsed.target;
        const targetSocket = meshSockets.get(targetId);
        if (targetSocket && targetSocket.readyState === 1) {
          targetSocket.send(JSON.stringify({
            type: 'signal',
            source: (socket as any).peerId,
            signal: parsed.signal
          }));
        }
        return;
      }

      socket.send(JSON.stringify({ type: 'echo', data: parsed }));
    } catch {
      socket.send(JSON.stringify({ type: 'echo', text: message.toString() }));
    }
  });

  socket.on('close', () => {
    if ((socket as any).peerId) {
      meshSockets.delete((socket as any).peerId);
    }
    if (authContext?.role === 'host') {
      connectedHosts.delete(socket);
    } else if (authContext?.role === 'guest' && authContext.guestId) {
      const sockets = connectedGuests.get(authContext.guestId);
      if (sockets) {
        sockets.delete(socket);
        if (sockets.size === 0) {
          connectedGuests.delete(authContext.guestId);
        }
      }
    }
  });
});

// SPA fallback for non-API routes
fastify.setNotFoundHandler(async (req, reply) => {
  if (req.url.startsWith('/api/') || req.url === '/ws') {
    return reply.status(404).send({ error: 'Endpoint not found' });
  }

  const indexPath = path.join(WEB_DIST, 'index.html');
  if (fs.existsSync(indexPath)) {
    return reply.type('text/html').send(fs.createReadStream(indexPath));
  }

  return reply.status(200).send(`<!DOCTYPE html>
<html>
  <head>
    <title>Gather</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .card { text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; border: 1px solid #334155; }
      h1 { color: #f59e0b; margin-bottom: 0.5rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Gather</h1>
      <p>Server running. Loading app...</p>
    </div>
  </body>
</html>`);
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
