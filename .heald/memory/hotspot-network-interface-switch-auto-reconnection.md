---
type: decision
title: "Hotspot Network Interface Switch Auto-Reconnection"
timestamp: 2026-10-07T13:06:36.936628777+00:00
---
Equipped Camera and Host Live WebSocket streams with resilient auto-reconnect loops (1.5s backoff). When connecting the PC and phone to a mobile hotspot, the underlying IP subnet switches (e.g. 192.168.1.9 -> 10.243.41.18); the socket detects interface dropouts and reconnects smoothly to restore the live stream.
