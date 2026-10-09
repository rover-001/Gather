---
type: decision
title: "In-feed P2P Badge and Offline Camera/Feed Resilience"
timestamp: 2026-10-07T12:48:08.632854761+00:00
---
Moved P2P badge from headers into the feed toolbar. Fixed offline camera and feed failure causes: 1) Eliminated session guard kickouts when offline so guests remain in the camera; 2) Handled background photo upload failures gracefully so offline captures always persist to local IndexedDB and broadcast over the mesh; 3) Maintained local WebRTC frame streaming directly to host.
