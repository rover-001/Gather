---
type: decision
title: "Fixed Mobile Authentication and Routing Pipeline"
timestamp: 2026-10-09T05:35:04.708986912+00:00
---
Resolved login and signup issues across backend and mobile client: 1) Extended Fastify join and login endpoints to return JWT token in JSON response body and added Authorization Bearer token header support to requireGuest middleware; 2) Updated mobile storage and API client to default to http://127.0.0.1:8080 (matching ADB reverse USB tunneling) and store tokens on join/login; 3) Improved QR URL parsing to route to HTTP port 8080 instead of HTTPS port 5173; 4) Fixed routing transitions so LoginScreen and JoinScreen support bi-directional navigation with prefilled slugs and navigation.reset into MainTabs; 5) Eliminated CameraView children deprecation warning by converting overlay to absolute sibling.
