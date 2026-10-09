---
type: decision
title: "Consolidated: Content & Media Creator"
timestamp: 2026-10-07T13:22:32.513585027+00:00
tags: [consolidated, "content-&-media-creator"]
---

# Consolidated: Content & Media Creator

Consolidated architectural decisions, system invariants, and implementation patterns.

## Core System Decisions & Invariants

- **Enable HTTPS via @vitejs/plugin-basic-ssl for secure camera permissions**: Installed and integrated @vitejs/plugin-basic-ssl in web/vite.config.ts and updated run.sh URLs to https://. Mobile browsers like Brave and Chrome strictly enforce HTTPS secure contexts for navigator.mediaDevices.getUserMedia (camera permissions) on non-localhost IPs. Basic SSL enables local self-signed HTTPS so guests can grant camera permissions on mobile.
- **Eliminate Live Camera Grid Latency and Backpressure Accumulation**: Tuned camera live encoder to eliminate frame queue stalls: lowered backpressure limit from 128KB to 32KB to immediately drop delayed frames, reduced preview maxDim to 480px (720px boosted), and lowered JPEG quality to 0.65 with disabled image smoothing for sub-8ms mobile encode speed.
- **In-feed P2P Badge and Offline Camera/Feed Resilience**: Moved P2P badge from headers into the feed toolbar. Fixed offline camera and feed failure causes: 1) Eliminated session guard kickouts when offline so guests remain in the camera; 2) Handled background photo upload failures gracefully so offline captures always persist to local IndexedDB and broadcast over the mesh; 3) Maintained local WebRTC frame streaming directly to host.
- **Keepsake Non-Blocking Background Camera Uploads with Client-Side Downscaling**: Converted guest camera photo capture to a non-blocking background queue. Captured photos are immediately queued, compressed/downscaled on client-side if oversized (>2560px or >1.5MB) to prevent 60-90s uplink freezes on mobile connections, and dispatched to /api/upload/photo in the background while keeping the shutter button unlocked and showing a floating upload progress pill.
- **Keepsake Complete Implementation: Host Live & Gallery, Guest Camera, Album and Me**: Completed full implementation of Keepsake: Host Live Camera Grid with binary streaming and focus boost, Host Curated Gallery with multi-select and guest/everyone sharing, Guest Camera with rear/front switch, photo/chunked-video uploads and 1fps live preview stream, Guest Gallery with Shared/Mine tabs, full-resolution Viewer, and Me account management with password change.

## Impacted Files & Subsystems

- `web/vite.config.ts`

## Consolidated Evolution History (5 items archived)

- 2026-10-07 — Enable HTTPS via @vitejs/plugin-basic-ssl for secure camera permissions (`enable-https-via-vitejsplugin-basic-ssl-for-secure-camera-permissions.md`)
- 2026-10-07 — Eliminate Live Camera Grid Latency and Backpressure Accumulation (`eliminate-live-camera-grid-latency-and-backpressure-accumulation.md`)
- 2026-10-07 — In-feed P2P Badge and Offline Camera/Feed Resilience (`in-feed-p2p-badge-and-offline-camerafeed-resilience.md`)
- 2026-10-06 — Keepsake Non-Blocking Background Camera Uploads with Client-Side Downscaling (`keepsake-non-blocking-background-camera-uploads-with-client-side-downscaling.md`)
- 2026-10-06 — Keepsake Complete Implementation: Host Live & Gallery, Guest Camera, Album and Me (`keepsake-complete-implementation-host-live--gallery-guest-camera-album-and-me.md`)
