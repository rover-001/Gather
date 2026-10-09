---
type: decision
title: "Consolidated: SQLite DB & Concurrency"
timestamp: 2026-10-07T13:01:29.391447314+00:00
tags: [consolidated, "sqlite-db-&-concurrency"]
---

# Consolidated: SQLite DB & Concurrency

Consolidated architectural decisions, system invariants, and implementation patterns.

## Core System Decisions & Invariants

- **Direct Binary Native Dispatch and Memoized Canvas Live Wall**: Improved live video streaming pipeline performance: 1) Guest mobile encoder now dispatches raw Blob objects directly via ws.send(blob) instead of awaiting async ArrayBuffer conversion, reducing frame transmission latency by 4-6ms; 2) Host LiveCanvasTile is wrapped in React.memo to ensure 0 React re-renders while HTML5 2D canvas context renders at 60fps.
- **Keepsake Hardware-Accelerated Canvas Live Wall and Optimized Mobile Encoder**: Replaced Host Live Wall DOM img elements with hardware-accelerated HTML5 Canvas tiles using createImageBitmap and direct 2D context painting. Eliminated React state re-render stalls and URL.revokeObjectURL churn on incoming video frames. Calibrated guest mobile camera encoder to 640px maxDim (960px boosted) and 0.72 quality for ultra-fast sub-12ms frame processing on mobile phones.

## Impacted Files & Subsystems

*(Files referenced in historical session logs)*

## Consolidated Evolution History (2 items archived)

- 2026-10-07 — Direct Binary Native Dispatch and Memoized Canvas Live Wall (`direct-binary-native-dispatch-and-memoized-canvas-live-wall.md`)
- 2026-10-06 — Keepsake Hardware-Accelerated Canvas Live Wall and Optimized Mobile Encoder (`keepsake-hardware-accelerated-canvas-live-wall-and-optimized-mobile-encoder.md`)
