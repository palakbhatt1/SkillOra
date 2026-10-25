# SkillOra frontend

Next.js 15 + GSAP. Run: `npm install` then `npm run dev` (http://localhost:3000).

- `/` landing page (ScrollTrigger: pinned horizontal workflow, scrubbed timeline, counters, parallax)
- `/sources` `/verify` `/job` `/tailor` `/score` `/export` — the 6 workflow screens

Fluid sizing: every dimension is in `rem`, and the root font-size in `app/globals.css` scales with
viewport width, so the whole UI keeps the same proportions at any screen size. No max-width cap.

Data is a local demo dataset (`lib/data.ts`) with shared state (`lib/store.tsx`); no backend is connected yet.
