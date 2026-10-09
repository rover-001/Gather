---
type: log
---
# Memory Log

## Session 2026-10-06T14:55:40.558554329+00:00

Fixed laggy/blurry host live feed: guest preview now ~8fps@1280px (boost 15fps@1920px, honors host boost), relaxed backpressure; host coalesces frames via rAF and no longer reconnects socket on guestMap change.

## Session 2026-10-06T15:03:34.397143688+00:00

Added Join an event nav link + code/link join form on landing (/e/<slug>), and /cam session guard redirecting unauthenticated users to /?join=1 (pending -> /waiting).
