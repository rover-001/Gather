---
type: decision
title: "Direct QR Scanner First Screen with Auto-Login Navigation"
timestamp: 2026-10-09T05:16:27.790923147+00:00
---
Created ScanScreen as the initial launch screen of Gather mobile app. Uses CameraView with QR barcode scanner settings, interactive target reticle, flashlight toggle, and manual code entry fallback. Automatically parses QR URLs or slugs, triggers haptic feedback, and navigates directly to LoginScreen with the event slug pre-populated.
