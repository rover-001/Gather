---
type: decision
title: "Hotspot LAN IP logging in run.sh and Vite allowedHosts unrestricted"
timestamp: 2026-10-07T13:15:33.777915492+00:00
---
Added auto-detection of dynamic LAN/Hotspot IP to run.sh banner so the host always sees the exact phone access URL (http://<LAN_IP>:5173 and /cam). Updated web/vite.config.ts allowedHosts to true to prevent ERR_CONNECTION_CLOSED or 403 blocks when mobile devices access Vite over Wi-Fi hotspot subnet IPs.
