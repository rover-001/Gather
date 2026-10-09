---
type: decision
title: "Keepsake Architecture and Database Provisioning"
timestamp: 2026-10-06T11:42:21.911859696+00:00
---
Established Keepsake stack with Fastify Node 22 backend, Postgres 18 in Docker (pg-db, database keepsake, user rover), Drizzle ORM, and Vite React TypeScript Tailwind web app. Implemented security invariants: host password cookie required for /host/* and /api/host/*, per-request DB pass checks, and per-request media sharing validation.
