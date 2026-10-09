---
type: decision
title: "Rebrand Keepsake to Gather: charcoal + electric blue"
timestamp: 2026-10-06T14:52:31.690854314+00:00
---
Renamed platform to Gather. Added brand-* blue tokens and charcoal slate-800/900/950 via @theme in web/src/index.css; primary buttons/active states use bg-brand-600; dark surfaces (guest layout, live tiles) stay charcoal. New LogoMark in web/src/components/Logo.tsx and favicon. Landing page gained scroll-reveal/float/marquee animations and an Emergency mode (tsunami live feed + alerts) section that is landing-copy only, not yet implemented in the app. DB name and JWT default secret left as keepsake to avoid breaking existing data/sessions.
