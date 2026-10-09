---
type: decision
title: "Keepsake Delete Media and Delete Folder Fix"
timestamp: 2026-10-06T14:33:16.757418435+00:00
---
Fixed media deletion failing with 400 Bad Request by preventing api() from setting Content-Type: application/json on bodiless requests and making server JSON parser lenient. Added dedicated batch delete endpoint, whole-folder delete buttons, and guest viewer/gallery delete capabilities for own photos.
