---
type: decision
title: "Keepsake Non-Blocking Background Camera Uploads with Client-Side Downscaling"
timestamp: 2026-10-06T13:14:09.920539446+00:00
---
Converted guest camera photo capture to a non-blocking background queue. Captured photos are immediately queued, compressed/downscaled on client-side if oversized (>2560px or >1.5MB) to prevent 60-90s uplink freezes on mobile connections, and dispatched to /api/upload/photo in the background while keeping the shutter button unlocked and showing a floating upload progress pill.
