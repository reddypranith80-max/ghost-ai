# Context

- **Problem**: teams using AI agents lack one place to give a goal and stack and watch agents plan, commit and ship.
- **Users**: solo founders and small teams shipping SaaS with agent help.
- **Constraints**: deploy to Vercel (full stack) and GitHub Pages (static demo); SQLite locally, Turso in prod; no secrets needed locally.
- **Modes**: full (Clerk + DB + API) and demo (`NEXT_PUBLIC_DEMO=1`, mock data, static export).
- **Source of truth**: `src/lib/contracts.ts` (Zod schemas and types), `docs/product-brief.md`, `STATUS.md`.
