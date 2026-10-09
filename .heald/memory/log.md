---
type: log
---
# Memory Log

## Session 2026-10-06T12:36:07.694309672+00:00

Implemented and verified Host Live grid, Host Curated Gallery with sharing, Guest Camera with live previews, Guest Album with tabs & viewer, and Guest Me profile

## Session 2026-10-06T12:41:33.673324005+00:00

Optimized mobile guest load time with route code-splitting, improved fallback title, and updated placeholder name

## Session 2026-10-06T12:43:40.785317493+00:00

Fixed mobile browser camera permission prompt behavior and added instant camera/gallery upload fallback

## Session 2026-10-06T12:45:27.417048301+00:00

Fixed mobile browser camera permission prompt cycle and added unblock guide and native snapshot trigger

## Session 2026-10-06T12:52:06.946823731+00:00

Added Native Phone Processing mode, elevated shutter button above bottom bar, made live feed optional with toggle button, and upgraded live grid stream quality

## Session 2026-10-06T12:58:44.238348843+00:00

Added Tap to Focus with animated golden focus ring and continuous hardware focus, eliminated live feed lag with backpressure 480p pacing, removed phone HD processing badges, raised shutter button higher, and fixed own shots display in My shots gallery

## Session 2026-10-06T13:02:47.616851146+00:00

Configured live grid stream with real native camera dimensions and aspect ratio, eliminating stretched blur

## Session 2026-10-06T13:08:07.224916351+00:00

Re-established background Tailscale Funnel listener on port 443 proxying to Vite on 5173

## Session 2026-10-06T13:14:13.342036955+00:00

Added non-blocking background photo uploads with smart client compression in Camera to ensure the shutter never freezes on mobile uplinks, and verified gallery rendering.

## Session 2026-10-06T13:20:26.245874503+00:00

Organized media into collapsible folders per uploader in Host and Guest galleries, added Folders vs Flat Grid toggle, and fixed checkbox selection click interception.

## Session 2026-10-06T13:39:26.738074452+00:00

Transformed gallery folders into an OS file-manager style where folders are collapsed by default in a row/grid and open on demand with breadcrumbs.

## Session 2026-10-06T13:41:46.755757020+00:00

Removed the Storage Used stat tile from Overview, moved Event Details editor into Overview Dashboard, and simplified Event & QR page to QR and access controls.

## Session 2026-10-06T13:52:20.235778738+00:00

Fixed icon alignments on the Guests page and table: centered search icon and filter tab icons, and standardized action button dimensions to uniform inline-flex containers across all rows.

## Session 2026-10-06T14:33:48.462744919+00:00

Fixed deletion failing on images and folders. Resolved Fastify 400 Bad Request on empty JSON bodies for DELETE calls, implemented batch delete endpoint, added direct Delete Folder controls in Host Gallery, and added delete support in Guest Gallery and Viewer for a guest's own photos.

## Session 2026-10-06T14:36:48.330537016+00:00

Optimized host and guest portal for speed and responsiveness: added slide-out mobile hamburger drawer with backdrop, removed the LIVE badge from the host header, made the sticky multi-select action bar scrollable on small screens, and ensured fluid layouts across phone, tablet, and desktop.

## Session 2026-10-06T14:42:16.072492582+00:00

Designed and implemented a high-fidelity organic landing page with curved geometric hero cards, lime-green highlights, SVG contours, floating overlay badges, and comprehensive interactive use cases (Disaster & Flood Operations, Weddings & Receptions, College Fests & Music Festivals, and Corporate Convocations).

## Session 2026-10-06T14:44:31.991661807+00:00

Rebuilt the landing page to directly mirror the visual architecture of the user reference design: framed card container, panoramic scenery background, organic lime-green hero card with embedded badge accents, dashed metric section, right-side photographic canvas with 4 organic floating badge shapes, and multi-industry use case switching (Disasters & Floods, Weddings, College Fests, and Corporate Functions).

## Session 2026-10-06T14:47:03.930773093+00:00

Reworked landing page (web/src/pages/Landing) to event-focused modern design; added PhoneMockup component; typecheck and build pass.

## Session 2026-10-06T14:52:31.694054929+00:00

Rebranded to Gather (name, logo, favicon, blue/charcoal theme across app), animated landing page, added emergency-mode section (landing only). Typecheck and build pass.

## Session 2026-10-06T15:17:24.775851648+00:00

Optimized mobile live stream encoder and guest navigation: calibrated 1080p sensor constraints, fluid 800px preview pacing, in-memory client caching for instant Album/Me switching, HTTP Cache-Control headers for media/thumbnails, and route prefetching on touch.

## Session 2026-10-06T15:25:46.541945025+00:00

Optimized Host Live Wall and Guest Camera real-time streaming: replaced DOM img tags with hardware-accelerated Canvas tiles rendering via createImageBitmap directly to bypass React render stalls and DOM decoding bottlenecks. Calibrated mobile JPEG encoder to 640px maxDim (960px boosted) and 0.72 quality for fluid, low-latency 12-15fps transmission.

## Session 2026-10-07T11:47:37.401868362+00:00

Renamed workspace directory from Keepsake to Gather, updated server package metadata and run scripts, and created p2p-offline-plan.md detailing complete offline peer-to-peer mesh architecture for phone-to-phone operation without internet.

## Session 2026-10-07T11:48:37.265941833+00:00

Moved and unified the complete Gather implementation roadmap and offline P2P mesh architecture directly into plan.md in the project directory.

## Session 2026-10-07T11:52:37.264327894+00:00

Implemented offline WebRTC mesh layer, offline local IndexedDB storage, and wired camera background upload to save to local IndexedDB for Gather P2P mesh.

## Session 2026-10-07T11:53:08.417542008+00:00

Completed Gather rebrand folder rename, merged P2P offline mesh plan into plan.md, committed changes locally, and implemented P2P WebRTC mesh data layer with offline IndexedDB camera persistence.

## Session 2026-10-07T12:29:04.960537929+00:00

Implemented comprehensive wired, wireless Wi-Fi, Bluetooth LE, and optical air-gapped QR peer-to-peer offline mesh system with interactive controls and direct phone-to-phone synchronization.

## Session 2026-10-07T12:31:28.239793018+00:00

Fixed bracket syntax error in server/src/index.ts, rebuilt backend, and restarted server on port 8080. Verified Vite proxy to port 8080 is returning 200 OK.

## Session 2026-10-07T12:42:46.792366964+00:00

Added automated zero-config P2P mesh discovery and handshake so devices automatically scan and link to the host and all connected peers without manual intervention.

## Session 2026-10-07T12:48:15.117992657+00:00

Moved P2P badge inside the feed toolbar, removed header clutter, and hardened offline camera and feed resilience so camera capture and local P2P mesh operate smoothly without internet.

## Session 2026-10-07T12:50:23.491530413+00:00

Locked viewport and eliminated mobile scrolling on the camera screen with fullScreen 100dvh layout, touch-none controls, and snug shutter button padding.

## Session 2026-10-07T12:58:39.760810542+00:00

Tuned camera live stream encoder to sub-8ms processing by lowering max dimension to 480px, adjusting JPEG quality to 0.65, and dropping queued frames at 32KB backpressure threshold to eliminate live wall lag.

## Session 2026-10-07T13:01:34.824274614+00:00

Optimized live streaming pipeline by removing async ArrayBuffer promise conversion on mobile phones and memoizing host canvas tiles with React.memo for high-frame-rate rendering.

## Session 2026-10-07T13:06:42.941183799+00:00

Added resilient WebSocket auto-reconnect loops to Camera and Host Live wall so when connecting under a mobile hotspot (switching network subnets), the live stream automatically restores without manual page reloads.

## Session 2026-10-07T13:15:39.273876736+00:00

Added Hotspot LAN IP detection and URL banner in run.sh, relaxed Vite allowedHosts to true to prevent ERR_CONNECTION_CLOSED on mobile browsers connecting over Wi-Fi hotspots, and verified clean build.

## Session 2026-10-07T13:22:36.511336449+00:00

Added @vitejs/plugin-basic-ssl to Vite config and updated run.sh to https:// URLs, ensuring mobile browsers (Brave/Chrome) treat the hotspot IP as a secure context to permit camera access.

## Session 2026-10-09T05:06:38.410935006+00:00

Removed temp branch from remote, set main as sole default branch with zero code files, and launched daemon on main to push Stage 1 at ~10:56:16

## Session 2026-10-09T05:11:21.515546866+00:00

Diagnosed and resolved infinite loading on Android: installed react-native-svg for Lucide icons, enabled adb reverse port forwarding, fixed route fallback in AppNavigator, and confirmed Gather is rendering live on device.

## Session 2026-10-09T05:16:32.876809206+00:00

Implemented ScanScreen as the app's default first screen. It features an interactive camera QR scanner reticle, flashlight toggle, and manual code entry fallback. Upon scanning an event QR, it navigates directly into the login screen with the event slug automatically bound.

## Session 2026-10-09T05:28:31.356929511+00:00

Pushed Stage 1 (server backend) to origin main using isolated worktree at 10:57 (21 mins after initial instruction), and scheduled Stage 2 (web frontend) for ~11:18

## Session 2026-10-09T05:35:11.888968292+00:00

Diagnosed and fixed mobile login/signup routing: added JWT Bearer token return and authentication support to server routes and middleware, defaulted mobile API host to 127.0.0.1:8080 over USB reverse tunnel, fixed QR URL parser port mapping, and linked bi-directional slug navigation between Scan, Login, and Join screens.

## Session 2026-10-09T05:49:30.031394905+00:00

Diagnosed and resolved 502 Bad Gateway and connection errors on Tailscale Funnel (omarchy.tailedcbcc.ts.net): reset and updated Tailscale Funnel proxy target from plain HTTP to https+insecure://127.0.0.1:5173 to match Vite basicSsl TLS server, tested external route reachability, and automated the configuration check in run.sh.
