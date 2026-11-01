# Ghost AI

[![Live demo](https://img.shields.io/badge/live%20demo-GitHub%20Pages-blue)](https://<user>.github.io/<repo>/)
[![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<user>/<repo>/actions)

Feed in a goal and a tech stack, then watch specialised AI agents plan tasks, split modules, commit code and ship.

Live demo (static, mock data): https://<user>.github.io/<repo>/

## Quick start

```bash
npm ci
npm run dev        # http://localhost:3000, no secrets needed (demo mode)
```

Other: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `node scripts/pages-build.mjs` (static export to `out/`), `docker build -t ghost-ai .`

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_DEMO` | no | `1` = demo mode, mock data, no Clerk |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | prod | Clerk frontend key |
| `CLERK_SECRET_KEY` | prod | Clerk backend key |
| `TURSO_DATABASE_URL` | prod | libSQL URL (default local `file:` SQLite) |
| `TURSO_AUTH_TOKEN` | prod | Turso token |
| `GITHUB_PAGES` | build | `true` = static export |
| `NEXT_PUBLIC_BASE_PATH` | Pages | e.g. `/<repo>` |
| `DOCKER` | build | `1` = standalone output |

## Docs

[architecture](docs/architecture.md) · [context](docs/context.md) · [methods](docs/methods.md) · [logs](docs/logs.md) · [connectivity](docs/connectivity.md) · [prose](docs/prose.md) · [agents](docs/agents.md) · [ADR 0001](docs/adr/0001-stack.md)
