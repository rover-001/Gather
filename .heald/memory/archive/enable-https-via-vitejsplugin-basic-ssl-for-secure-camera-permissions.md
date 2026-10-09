---
type: decision
title: "Enable HTTPS via @vitejs/plugin-basic-ssl for secure camera permissions"
timestamp: 2026-10-07T13:22:32.513585027+00:00
---
Installed and integrated @vitejs/plugin-basic-ssl in web/vite.config.ts and updated run.sh URLs to https://. Mobile browsers like Brave and Chrome strictly enforce HTTPS secure contexts for navigator.mediaDevices.getUserMedia (camera permissions) on non-localhost IPs. Basic SSL enables local self-signed HTTPS so guests can grant camera permissions on mobile.
