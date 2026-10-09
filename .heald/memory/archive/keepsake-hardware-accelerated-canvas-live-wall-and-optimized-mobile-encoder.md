---
type: decision
title: "Keepsake Hardware-Accelerated Canvas Live Wall and Optimized Mobile Encoder"
timestamp: 2026-10-06T15:25:41.770813706+00:00
---
Replaced Host Live Wall DOM img elements with hardware-accelerated HTML5 Canvas tiles using createImageBitmap and direct 2D context painting. Eliminated React state re-render stalls and URL.revokeObjectURL churn on incoming video frames. Calibrated guest mobile camera encoder to 640px maxDim (960px boosted) and 0.72 quality for ultra-fast sub-12ms frame processing on mobile phones.
