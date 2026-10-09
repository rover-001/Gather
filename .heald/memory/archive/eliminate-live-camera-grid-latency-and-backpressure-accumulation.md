---
type: decision
title: "Eliminate Live Camera Grid Latency and Backpressure Accumulation"
timestamp: 2026-10-07T12:58:29.291121274+00:00
---
Tuned camera live encoder to eliminate frame queue stalls: lowered backpressure limit from 128KB to 32KB to immediately drop delayed frames, reduced preview maxDim to 480px (720px boosted), and lowered JPEG quality to 0.65 with disabled image smoothing for sub-8ms mobile encode speed.
