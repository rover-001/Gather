---
type: decision
title: "Tailscale Funnel HTTPS Insecure Target for Vite Basic SSL"
timestamp: 2026-10-09T05:49:24.994078522+00:00
---
When @vitejs/plugin-basic-ssl is used, Vite dev server serves HTTPS with a local self-signed certificate. Tailscale Funnel must proxy to https+insecure://127.0.0.1:5173 rather than http://127.0.0.1:5173 to prevent 502 Bad Gateway and connection resets when guests scan QR join codes.
