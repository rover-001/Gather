---
type: decision
title: "Eliminate Camera Page Viewport Scrolling on Mobile"
timestamp: 2026-10-07T12:50:18.793312416+00:00
---
Locked viewport scrolling on the camera screen using fullScreen mode in GuestLayout (h-[100dvh], fixed inset-0, touch-none, overflow-hidden) and calibrated bottom shutter control padding (pb-6) so mobile browsers never rubber-band or scroll downwards.
