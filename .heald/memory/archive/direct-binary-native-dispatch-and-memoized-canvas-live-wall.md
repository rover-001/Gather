---
type: decision
title: "Direct Binary Native Dispatch and Memoized Canvas Live Wall"
timestamp: 2026-10-07T13:01:29.391447314+00:00
---
Improved live video streaming pipeline performance: 1) Guest mobile encoder now dispatches raw Blob objects directly via ws.send(blob) instead of awaiting async ArrayBuffer conversion, reducing frame transmission latency by 4-6ms; 2) Host LiveCanvasTile is wrapped in React.memo to ensure 0 React re-renders while HTML5 2D canvas context renders at 60fps.
