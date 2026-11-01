# Product Brief — Ghost AI

**Problem**: Teams building with AI agents lack one place to feed in a goal + tech stack and watch specialised agents plan tasks, split modules, commit code and ship.
**Users**: Solo founders and small teams shipping SaaS with agent help.
**Core features**: (1) Create a project from brief + stack, (2) Agent roster with live status, (3) Task board by module, (4) Git-log timeline of agent commits, (5) Flow graph of the pipeline (Architect→Backend/Frontend→DevOps/QA→Security→Reviewer), (6) Auth (Clerk) with demo-mode fallback.
**NFRs**: deploys on Vercel (full stack) and GitHub Pages (static demo), SQLite/libSQL (Turso in prod), no secrets required to run locally.
**Stack**: Next.js (App Router), React, Tailwind v4, shadcn/ui, Clerk, Drizzle + libSQL, Zod, framer-motion.
