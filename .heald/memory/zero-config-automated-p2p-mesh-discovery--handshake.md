---
type: decision
title: "Zero-Config Automated P2P Mesh Discovery & Handshake"
timestamp: 2026-10-07T12:42:41.648390538+00:00
---
Upgraded P2P mesh layer to automatically discover and connect any peer upon opening the app. The WebSocket router immediately broadcasts newly connected peers and returns the full list of active peers on join_mesh, initiating WebRTC offers and answers automatically without manual pairing steps.
