---
type: decision
title: "Consolidated: Backend & Deployment"
timestamp: 2026-10-07T13:15:33.777915492+00:00
tags: [consolidated, "backend-&-deployment"]
---

# Consolidated: Backend & Deployment

Consolidated architectural decisions, system invariants, and implementation patterns.

## Core System Decisions & Invariants

- **Hotspot LAN IP logging in run.sh and Vite allowedHosts unrestricted**: Added auto-detection of dynamic LAN/Hotspot IP to run.sh banner so the host always sees the exact phone access URL (http://<LAN_IP>:5173 and /cam). Updated web/vite.config.ts allowedHosts to true to prevent ERR_CONNECTION_CLOSED or 403 blocks when mobile devices access Vite over Wi-Fi hotspot subnet IPs.
- **Fix Server Syntax Error and Restore Port 8080 Service**: Fixed a missing bracket closure in server/src/index.ts that caused esbuild transform failure and ECONNREFUSED on port 8080. Rebuilt server and restarted tsx watch on port 8080 with verified 200 OK proxy response.
- **Gather Folder Renaming and P2P Offline Mesh Architecture Plan**: Renamed main repository directory from Keepsake to Gather and updated package names and run scripts. Authored comprehensive P2P offline mesh architecture plan covering zero-internet local hotspot and WebRTC mesh topologies, visual/LAN signaling, CRDT metadata sync, and content-addressable swarming.
- **Keepsake Delete Media and Delete Folder Fix**: Fixed media deletion failing with 400 Bad Request by preventing api() from setting Content-Type: application/json on bodiless requests and making server JSON parser lenient. Added dedicated batch delete endpoint, whole-folder delete buttons, and guest viewer/gallery delete capabilities for own photos.
- **Keepsake Guest Access and Event Slug QR Architecture**: Transitioned from individual device-bound passes to an Event-level QR code model with guest phone + password registration. Guests register at /e/:slug and authenticate on any device with their phone and password. Host controls event joining toggles (joinOpen, requireApproval), sees all media in host gallery, and shares chosen media with specific guests or Everyone. Enforced per-request database authorization for all media access.
- **Keepsake Architecture and Database Provisioning**: Established Keepsake stack with Fastify Node 22 backend, Postgres 18 in Docker (pg-db, database keepsake, user rover), Drizzle ORM, and Vite React TypeScript Tailwind web app. Implemented security invariants: host password cookie required for /host/* and /api/host/*, per-request DB pass checks, and per-request media sharing validation.

## Impacted Files & Subsystems

- `server/src/index.ts`
- `web/vite.config.ts`

## Consolidated Evolution History (6 items archived)

- 2026-10-07 — Hotspot LAN IP logging in run.sh and Vite allowedHosts unrestricted (`hotspot-lan-ip-logging-in-runsh-and-vite-allowedhosts-unrestricted.md`)
- 2026-10-07 — Fix Server Syntax Error and Restore Port 8080 Service (`fix-server-syntax-error-and-restore-port-8080-service.md`)
- 2026-10-07 — Gather Folder Renaming and P2P Offline Mesh Architecture Plan (`gather-folder-renaming-and-p2p-offline-mesh-architecture-plan.md`)
- 2026-10-06 — Keepsake Delete Media and Delete Folder Fix (`keepsake-delete-media-and-delete-folder-fix.md`)
- 2026-10-06 — Keepsake Guest Access and Event Slug QR Architecture (`keepsake-guest-access-and-event-slug-qr-architecture.md`)
- 2026-10-06 — Keepsake Architecture and Database Provisioning (`keepsake-architecture-and-database-provisioning.md`)
