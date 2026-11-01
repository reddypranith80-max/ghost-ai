# ADR 0001: Technology stack

Status: Accepted

## Context
One codebase must deploy to Vercel (full stack) and GitHub Pages (static demo) and run locally with no secrets.

## Decision
Next.js App Router + React; Tailwind v4 + shadcn/ui; framer-motion; Clerk auth with demo fallback; Drizzle ORM over libSQL (local SQLite, Turso in prod); Zod contracts shared by client and server.

## Consequences
- Static export needs API routes and the proxy removed at build time (`scripts/pages-build.mjs`).
- libSQL keeps local dev dependency-free and prod serverless-friendly.
- Clerk is an external dependency, mitigated by demo mode.
