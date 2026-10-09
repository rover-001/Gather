---
type: decision
title: "Keepsake Guest Access and Event Slug QR Architecture"
timestamp: 2026-10-06T12:08:39.617265797+00:00
---
Transitioned from individual device-bound passes to an Event-level QR code model with guest phone + password registration. Guests register at /e/:slug and authenticate on any device with their phone and password. Host controls event joining toggles (joinOpen, requireApproval), sees all media in host gallery, and shares chosen media with specific guests or Everyone. Enforced per-request database authorization for all media access.
