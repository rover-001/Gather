import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { normalizePhone } from '../utils/phone.js';
import { requireGuest } from '../middleware/auth.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import archiver from 'archiver';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { MEDIA_DIR, connectedHosts, connectedGuests } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function guestRoutes(fastify: FastifyInstance) {
  // Public: Get Event Public Info by Slug
  fastify.get<{ Params: { slug: string } }>('/api/events/:slug', async (req, reply) => {
    const { slug } = req.params;
    const [eventRow] = await db
      .select({
        id: schema.event.id,
        name: schema.event.name,
        date: schema.event.date,
        slug: schema.event.slug,
        joinOpen: schema.event.joinOpen,
        requireApproval: schema.event.requireApproval,
      })
      .from(schema.event)
      .where(eq(schema.event.slug, slug))
      .limit(1);

    if (!eventRow) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    return { event: eventRow };
  });

  // Public: Join Event (Rate-limited: 10 joins/min per IP)
  fastify.post<{
    Params: { slug: string };
    Body: { name: string; phone: string; password: string };
  }>(
    '/api/events/:slug/join',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (req, reply) => {
      const { slug } = req.params;
      const { name, phone: rawPhone, password } = req.body || {};

      if (!name || !rawPhone || !password || password.length < 6) {
        return reply.status(400).send({ error: 'Name, valid phone, and password (min 6 chars) required' });
      }

      const phone = normalizePhone(rawPhone);
      if (!phone || phone.length < 10) {
        return reply.status(400).send({ error: 'Please enter a valid phone number' });
      }

      const [eventRow] = await db
        .select()
        .from(schema.event)
        .where(eq(schema.event.slug, slug))
        .limit(1);

      if (!eventRow) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      if (!eventRow.joinOpen) {
        return reply.status(403).send({ error: 'Joining is currently closed for this event.' });
      }

      // Check if phone already registered
      const [existingGuest] = await db
        .select()
        .from(schema.guests)
        .where(and(eq(schema.guests.eventId, eventRow.id), eq(schema.guests.phone, phone)))
        .limit(1);

      if (existingGuest) {
        return reply.status(409).send({
          error: 'This phone number has already joined. Please log in with your password.',
          alreadyJoined: true,
        });
      }

      // Guest cap check (e.g. 300)
      const allGuests = await db
        .select()
        .from(schema.guests)
        .where(eq(schema.guests.eventId, eventRow.id));

      if (allGuests.length >= 300) {
        return reply.status(403).send({ error: 'Guest capacity reached for this event.' });
      }

      const passwordHash = await hashPassword(password);
      const initialStatus = eventRow.requireApproval ? 'pending' : 'active';

      const [newGuest] = await db
        .insert(schema.guests)
        .values({
          eventId: eventRow.id,
          name: name.trim(),
          phone,
          passwordHash,
          status: initialStatus,
          canDownload: true,
          mustChangePassword: false,
          lastSeenAt: new Date(),
        })
        .returning();

      // Set guest session cookie
      const token = fastify.jwt.sign({
        role: 'guest',
        guestId: newGuest.id,
        eventId: eventRow.id,
      });

      reply.setCookie('guest_token', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: req.protocol === 'https',
      });

      return {
        success: true,
        guest: {
          id: newGuest.id,
          name: newGuest.name,
          phone: newGuest.phone,
          status: newGuest.status,
          canDownload: newGuest.canDownload,
        },
      };
    }
  );

  // Public: Guest Login (Rate-limited: 5 attempts/min per IP)
  fastify.post<{
    Params: { slug: string };
    Body: { phone: string; password: string };
  }>(
    '/api/events/:slug/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    async (req, reply) => {
      const { slug } = req.params;
      const { phone: rawPhone, password } = req.body || {};

      if (!rawPhone || !password) {
        return reply.status(400).send({ error: 'Phone number and password required' });
      }

      const phone = normalizePhone(rawPhone);

      const [eventRow] = await db
        .select()
        .from(schema.event)
        .where(eq(schema.event.slug, slug))
        .limit(1);

      if (!eventRow) {
        return reply.status(404).send({ error: 'Event not found' });
      }

      const [guestRow] = await db
        .select()
        .from(schema.guests)
        .where(and(eq(schema.guests.eventId, eventRow.id), eq(schema.guests.phone, phone)))
        .limit(1);

      if (!guestRow) {
        return reply.status(401).send({ error: 'No account found with this phone number. Please join first.' });
      }

      const isValid = await verifyPassword(password, guestRow.passwordHash);
      if (!isValid) {
        return reply.status(401).send({ error: 'Incorrect password' });
      }

      // Update last seen
      await db
        .update(schema.guests)
        .set({ lastSeenAt: new Date() })
        .where(eq(schema.guests.id, guestRow.id));

      const token = fastify.jwt.sign({
        role: 'guest',
        guestId: guestRow.id,
        eventId: eventRow.id,
      });

      reply.setCookie('guest_token', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: req.protocol === 'https',
      });

      return {
        success: true,
        guest: {
          id: guestRow.id,
          name: guestRow.name,
          phone: guestRow.phone,
          status: guestRow.status,
          canDownload: guestRow.canDownload,
          mustChangePassword: guestRow.mustChangePassword,
        },
      };
    }
  );

  // Logout
  fastify.post('/api/logout', async (_req, reply) => {
    reply.clearCookie('guest_token', { path: '/' });
    return { success: true };
  });

  // Protected Guest routes
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', requireGuest);

    // Current Guest Info
    protectedRoutes.get('/api/me', async (req) => {
      const guest = (req as any).guest;
      return {
        guest: {
          id: guest.id,
          name: guest.name,
          phone: guest.phone,
          status: guest.status,
          canDownload: guest.canDownload,
          mustChangePassword: guest.mustChangePassword,
        },
      };
    });

    // Change Password
    protectedRoutes.post<{ Body: { oldPassword?: string; newPassword: string } }>(
      '/api/me/password',
      async (req, reply) => {
        const guest = (req as any).guest;
        const { oldPassword, newPassword } = req.body || {};

        if (!newPassword || newPassword.length < 6) {
          return reply.status(400).send({ error: 'New password must be at least 6 characters' });
        }

        // If not under forced password reset, verify old password
        if (!guest.mustChangePassword) {
          if (!oldPassword) {
            return reply.status(400).send({ error: 'Current password is required' });
          }
          const isCorrect = await verifyPassword(oldPassword, guest.passwordHash);
          if (!isCorrect) {
            return reply.status(401).send({ error: 'Current password is incorrect' });
          }
        }

        const newHash = await hashPassword(newPassword);
        await db
          .update(schema.guests)
          .set({
            passwordHash: newHash,
            mustChangePassword: false,
          })
          .where(eq(schema.guests.id, guest.id));

        return { success: true };
      }
    );

    // Upload Photo (multipart)
    protectedRoutes.post('/api/upload/photo', async (req, reply) => {
      const guest = (req as any).guest;
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const passDir = path.resolve(MEDIA_DIR, guest.id);
      if (!fs.existsSync(passDir)) {
        fs.mkdirSync(passDir, { recursive: true });
      }

      const fileId = crypto.randomUUID();
      const filePath = path.join(passDir, `${fileId}.jpg`);
      const thumbPath = path.join(passDir, `${fileId}_thumb.jpg`);

      // Stream file to disk
      await pipeline(data.file, fs.createWriteStream(filePath));
      const stats = fs.statSync(filePath);

      // Generate 400px thumbnail with sharp
      try {
        await sharp(filePath)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
      } catch (err) {
        // if sharp fails, fallback thumb to original
        fs.copyFileSync(filePath, thumbPath);
      }

      const relPath = `/media-files/${guest.id}/${fileId}.jpg`;
      const relThumb = `/media-files/${guest.id}/${fileId}_thumb.jpg`;

      const [newMedia] = await db
        .insert(schema.media)
        .values({
          eventId: guest.eventId,
          guestId: guest.id,
          kind: 'photo',
          path: relPath,
          thumbPath: relThumb,
          sizeBytes: stats.size,
          visibility: 'host',
        })
        .returning();

      // Notify host sockets of new photo
      for (const hostSocket of connectedHosts) {
        if (hostSocket.readyState === 1) {
          hostSocket.send(JSON.stringify({ type: 'new_media', media: newMedia }));
        }
      }

      // Notify guest sockets of gallery update
      const guestSockets = connectedGuests.get(guest.id);
      if (guestSockets) {
        for (const gs of guestSockets) {
          if (gs.readyState === 1) {
            gs.send(JSON.stringify({ type: 'gallery_updated', media: newMedia }));
          }
        }
      }

      return { success: true, media: newMedia };
    });

    // Upload Video Chunk
    const videoUploads = new Map<string, { expectedSeq: number; filePath: string }>();

    protectedRoutes.post<{
      Querystring: { id: string; seq: string };
    }>('/api/upload/video-chunk', async (req, reply) => {
      const guest = (req as any).guest;
      const { id, seq } = req.query;
      const seqNum = parseInt(seq, 10);

      const passDir = path.resolve(MEDIA_DIR, guest.id);
      if (!fs.existsSync(passDir)) fs.mkdirSync(passDir, { recursive: true });

      const targetPath = path.join(passDir, `${id}.mp4`);

      let session = videoUploads.get(id);
      if (!session) {
        session = { expectedSeq: 0, filePath: targetPath };
        videoUploads.set(id, session);
      }

      if (seqNum !== session.expectedSeq) {
        return reply.status(409).send({ error: 'Out of order chunk', expected: session.expectedSeq });
      }

      const data = await req.file();
      if (!data) return reply.status(400).send({ error: 'No chunk data' });

      const buffer = await data.toBuffer();
      fs.appendFileSync(targetPath, buffer);
      session.expectedSeq += 1;

      return { success: true, nextSeq: session.expectedSeq };
    });

    // Finalize Video
    protectedRoutes.post<{
      Querystring: { id: string };
    }>('/api/upload/video-done', async (req, reply) => {
      const guest = (req as any).guest;
      const { id } = req.query;

      const session = videoUploads.get(id);
      if (!session || !fs.existsSync(session.filePath)) {
        return reply.status(404).send({ error: 'Video upload session not found' });
      }

      const stats = fs.statSync(session.filePath);
      const relPath = `/media-files/${guest.id}/${id}.mp4`;

      const [newMedia] = await db
        .insert(schema.media)
        .values({
          eventId: guest.eventId,
          guestId: guest.id,
          kind: 'video',
          path: relPath,
          thumbPath: relPath,
          sizeBytes: stats.size,
          visibility: 'host',
        })
        .returning();

      videoUploads.delete(id);

      for (const hostSocket of connectedHosts) {
        if (hostSocket.readyState === 1) {
          hostSocket.send(JSON.stringify({ type: 'new_media', media: newMedia }));
        }
      }

      return { success: true, media: newMedia };
    });

    // Guest Gallery List (Respects Access Rule strictly!)
    protectedRoutes.get<{
      Querystring: { tab?: 'shared' | 'mine' };
    }>('/api/gallery', async (req) => {
      const guest = (req as any).guest;
      const tab = req.query.tab || 'shared';

      const guestsRows = await db
        .select({ id: schema.guests.id, name: schema.guests.name })
        .from(schema.guests)
        .where(eq(schema.guests.eventId, guest.eventId));
      const guestMap = new Map(guestsRows.map((g) => [g.id, g.name]));

      if (tab === 'mine') {
        const myMedia = await db
          .select()
          .from(schema.media)
          .where(and(eq(schema.media.eventId, guest.eventId), eq(schema.media.guestId, guest.id)))
          .orderBy(desc(schema.media.createdAt));
        const enriched = myMedia.map((m) => ({
          ...m,
          uploaderName: guestMap.get(m.guestId) || guest.name || 'You',
        }));
        return { media: enriched, tab: 'mine' };
      }

      // Shared with this guest: visibility = 'all' OR row in shares for this guest
      const allSharedMedia = await db
        .select()
        .from(schema.media)
        .where(
          and(
            eq(schema.media.eventId, guest.eventId),
            sql`(${schema.media.visibility} = 'all' OR ${schema.media.id} IN (
              SELECT ${schema.shares.mediaId} FROM ${schema.shares} WHERE ${schema.shares.guestId} = ${guest.id}
            ))`
          )
        )
        .orderBy(desc(schema.media.createdAt));

      const enrichedShared = allSharedMedia.map((m) => ({
        ...m,
        uploaderName: guestMap.get(m.guestId) || 'Guest',
      }));

      return { media: enrichedShared, tab: 'shared' };
    });

    // Download All Shared as Streamed ZIP
    protectedRoutes.get('/api/zip', async (req, reply) => {
      const guest = (req as any).guest;
      if (!guest.canDownload) {
        return reply.status(403).send({ error: 'Downloads are disabled for your account' });
      }

      const allowedMedia = await db
        .select()
        .from(schema.media)
        .where(
          and(
            eq(schema.media.eventId, guest.eventId),
            sql`(${schema.media.guestId} = ${guest.id} OR ${schema.media.visibility} = 'all' OR ${schema.media.id} IN (
              SELECT ${schema.shares.mediaId} FROM ${schema.shares} WHERE ${schema.shares.guestId} = ${guest.id}
            ))`
          )
        );

      const archive = archiver('zip', { zlib: { level: 5 } });
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Disposition', 'attachment; filename="gather-photos.zip"');

      archive.pipe(reply.raw);

      for (const m of allowedMedia) {
        const filePath = path.resolve(__dirname, `../..${m.path.replace('/media-files', '/server/data/media')}`);
        if (fs.existsSync(filePath)) {
          const fileName = path.basename(filePath);
          archive.file(filePath, { name: fileName });
        }
      }

      await archive.finalize();
    });

    // Single Media Access (View/Download) - Checked against DB on every request!
    protectedRoutes.get<{
      Params: { id: string };
      Querystring: { download?: string };
    }>('/api/media/:id', async (req, reply) => {
      const guest = (req as any).guest;
      const { id } = req.params;
      const isDownload = req.query.download === '1' || req.query.download === 'true';

      if (isDownload && !guest.canDownload) {
        return reply.status(403).send({ error: 'Downloads are disabled for your account' });
      }

      // Access Rule: active guest AND (own shot OR visibility='all' OR row in shares)
      const [mediaItem] = await db
        .select()
        .from(schema.media)
        .where(
          and(
            eq(schema.media.id, id),
            eq(schema.media.eventId, guest.eventId),
            sql`(${schema.media.guestId} = ${guest.id} OR ${schema.media.visibility} = 'all' OR ${schema.media.id} IN (
              SELECT ${schema.shares.mediaId} FROM ${schema.shares} WHERE ${schema.shares.guestId} = ${guest.id}
            ))`
          )
        )
        .limit(1);

      if (!mediaItem) {
        return reply.status(404).send({ error: 'Media not found or not shared with you' });
      }

      const relClean = mediaItem.path.replace(/^\/media-files\//, '');
      const filePath = path.resolve(MEDIA_DIR, relClean);
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: 'File on disk not found' });
      }

      const contentType = mediaItem.kind === 'photo' ? 'image/jpeg' : 'video/mp4';
      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      if (isDownload) {
        const ext = mediaItem.kind === 'photo' ? 'jpg' : 'mp4';
        reply.header('Content-Disposition', `attachment; filename="gather-${mediaItem.id.slice(0, 8)}.${ext}"`);
      }

      return reply.send(fs.createReadStream(filePath));
    });

    // Thumbnail Access
    protectedRoutes.get<{
      Params: { id: string };
    }>('/api/media/:id/thumb', async (req, reply) => {
      const guest = (req as any).guest;
      const { id } = req.params;

      const [mediaItem] = await db
        .select()
        .from(schema.media)
        .where(
          and(
            eq(schema.media.id, id),
            eq(schema.media.eventId, guest.eventId),
            sql`(${schema.media.guestId} = ${guest.id} OR ${schema.media.visibility} = 'all' OR ${schema.media.id} IN (
              SELECT ${schema.shares.mediaId} FROM ${schema.shares} WHERE ${schema.shares.guestId} = ${guest.id}
            ))`
          )
        )
        .limit(1);

      if (!mediaItem) {
        return reply.status(404).send({ error: 'Thumbnail not found or not shared with you' });
      }

      const thumbRel = (mediaItem.thumbPath || mediaItem.path).replace(/^\/media-files\//, '');
      const filePath = path.resolve(MEDIA_DIR, thumbRel);
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: 'File on disk not found' });
      }

      reply.header('Content-Type', 'image/jpeg');
      reply.header('Cache-Control', 'private, max-age=86400, stale-while-revalidate=604800');
      return reply.send(fs.createReadStream(filePath));
    });

    // Guest Delete Media (Guests can delete their own uploaded photos/videos)
    protectedRoutes.delete<{ Params: { id: string } }>('/api/media/:id', async (req, reply) => {
      const guest = (req as any).guest;
      const { id } = req.params;

      const [deleted] = await db
        .delete(schema.media)
        .where(
          and(
            eq(schema.media.id, id),
            eq(schema.media.eventId, guest.eventId),
            eq(schema.media.guestId, guest.id)
          )
        )
        .returning();

      if (!deleted) {
        return reply.status(404).send({ error: 'Media not found or you do not have permission to delete it' });
      }

      try {
        const fullPath = path.resolve(MEDIA_DIR, deleted.path.replace(/^\/media-files\//, ''));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        if (deleted.thumbPath) {
          const thumbFullPath = path.resolve(MEDIA_DIR, deleted.thumbPath.replace(/^\/media-files\//, ''));
          if (fs.existsSync(thumbFullPath)) fs.unlinkSync(thumbFullPath);
        }
      } catch {
        // file cleanup ignore
      }

      // Notify host sockets that media was deleted
      for (const hostSocket of connectedHosts) {
        if (hostSocket.readyState === 1) {
          hostSocket.send(JSON.stringify({ type: 'gallery_updated' }));
        }
      }

      // Notify guest sockets
      for (const [, sockets] of connectedGuests) {
        for (const s of sockets) {
          try {
            s.send(JSON.stringify({ type: 'gallery_updated' }));
          } catch {
            // ignore
          }
        }
      }

      return { success: true, media: deleted };
    });
  });
}
