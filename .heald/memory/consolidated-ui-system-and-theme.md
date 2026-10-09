---
type: decision
title: "Consolidated: UI System & Theme"
timestamp: 2026-10-09T05:04:16.557202723+00:00
tags: [consolidated, "ui-system-&-theme"]
---

# Consolidated: UI System & Theme

Consolidated architectural decisions, system invariants, and implementation patterns.

## Core System Decisions & Invariants

- **Gather Expo Mobile App Scaffolding and Architecture Mapping**: Scaffolded a complete Expo React Native app in /mobile with TypeScript, React Navigation, expo-camera, expo-file-system, expo-haptics, expo-keep-awake, and async-storage. Mapped out all frontend routes, screens, and offline-first data flows between the web portal and native mobile app.
- **Eliminate Camera Page Viewport Scrolling on Mobile**: Locked viewport scrolling on the camera screen using fullScreen mode in GuestLayout (h-[100dvh], fixed inset-0, touch-none, overflow-hidden) and calibrated bottom shutter control padding (pb-6) so mobile browsers never rubber-band or scroll downwards.
- **Full Wired, Wireless, Bluetooth and Offline P2P Mesh Controls Implementation**: Equipped Gather with complete multi-transport offline connectivity: 1) Server WebRTC signaling relay for LAN Wi-Fi & Hotspots without internet; 2) Optical air-gapped QR WebRTC SDP pairing for routerless phone-to-phone pairing; 3) Web Bluetooth LE scanning integration via navigator.bluetooth; 4) Offline P2P mesh badge & interactive modal in Host and Guest layouts; 5) Offline P2P gallery tab to view photos synced directly across nearby phones.
- **Rebrand Keepsake to Gather: charcoal + electric blue**: Renamed platform to Gather. Added brand-* blue tokens and charcoal slate-800/900/950 via @theme in web/src/index.css; primary buttons/active states use bg-brand-600; dark surfaces (guest layout, live tiles) stay charcoal. New LogoMark in web/src/components/Logo.tsx and favicon. Landing page gained scroll-reveal/float/marquee animations and an Emergency mode (tsunami live feed + alerts) section that is landing-copy only, not yet implemented in the app. DB name and JWT default secret left as keepsake to avoid breaking existing data/sessions.
- **Keepsake Landing Page Overhaul Matching Reference Architecture**: Completely redesigned Keepsake landing page to mirror the reference structure: framed white container over an atmospheric backdrop, organic lime-green hero card with white pill highlights, dashed metric box with pill tags, panoramic photographic canvas with layered floating badges (rounded rectangle, dark circle, oblong pill, polygon), and interactive use cases covering Disaster & Flood Operations, Weddings, Fests & Concerts, and Corporate Functions.
- **Keepsake Mobile Responsiveness and Header Badge Optimization**: Added responsive mobile sidebar drawer with hamburger toggle and backdrop in HostLayout, removed the redundant LIVE badge in top navigation, and styled floating actions bar to scroll horizontally on small mobile screens.
- **Keepsake Guest Table Action Icons and Filter Alignment Fix**: Aligned all action icons in GuestTable to uniform w-8 h-8 flex button containers and ensured search and tab icons in Guests page maintain exact vertical centering and shrink-0 consistency.
- **Keepsake File Manager Style Folder Grid Layout**: Redesigned folder grouping in Host and Guest galleries into a native File Manager layout. Folders are collapsed by default and displayed as a clean horizontal grid of folder tiles. Clicking any folder tile opens its contents below with a breadcrumb bar, batch selector, and close button, allowing quick switching between user directories.
- **Keepsake Folders by Uploader and Fixed Checkbox Multi-Selection**: Added structured folders grouped by each guest/uploader in both Host and Guest galleries with collapsible headers, folder item count pills, and one-click whole-folder select/deselect. Fixed checkbox selection conflict where hover actions overlay was blocking the select button by elevating checkbox z-index to z-30 with explicit stopPropagation.

## Impacted Files & Subsystems

- `web/src/components/Logo.tsx`
- `web/src/index.css`

## Consolidated Evolution History (9 items archived)

- 2026-10-09 — Gather Expo Mobile App Scaffolding and Architecture Mapping (`gather-expo-mobile-app-scaffolding-and-architecture-mapping.md`)
- 2026-10-07 — Eliminate Camera Page Viewport Scrolling on Mobile (`eliminate-camera-page-viewport-scrolling-on-mobile.md`)
- 2026-10-07 — Full Wired, Wireless, Bluetooth and Offline P2P Mesh Controls Implementation (`full-wired-wireless-bluetooth-and-offline-p2p-mesh-controls-implementation.md`)
- 2026-10-06 — Rebrand Keepsake to Gather: charcoal + electric blue (`rebrand-keepsake-to-gather-charcoal--electric-blue.md`)
- 2026-10-06 — Keepsake Landing Page Overhaul Matching Reference Architecture (`keepsake-landing-page-overhaul-matching-reference-architecture.md`)
- 2026-10-06 — Keepsake Mobile Responsiveness and Header Badge Optimization (`keepsake-mobile-responsiveness-and-header-badge-optimization.md`)
- 2026-10-06 — Keepsake Guest Table Action Icons and Filter Alignment Fix (`keepsake-guest-table-action-icons-and-filter-alignment-fix.md`)
- 2026-10-06 — Keepsake File Manager Style Folder Grid Layout (`keepsake-file-manager-style-folder-grid-layout.md`)
- 2026-10-06 — Keepsake Folders by Uploader and Fixed Checkbox Multi-Selection (`keepsake-folders-by-uploader-and-fixed-checkbox-multi-selection.md`)
