# Logs and conventions

## Commit format
Conventional Commits: `type(scope): summary`, e.g. `feat(api): add project detail route`.
Types: feat, fix, docs, chore, ci, refactor, test.

## Agent commits in the Git Log UI
Each `GitLog` row (`hash`, `message`, `agent`, `files`, `at`) is one agent commit. The UI shows the short hash, message, an agent badge and file count in a reverse-chronological timeline. Real git commits by agents carry `Co-Authored-By` trailers.

## Observability
- `GET /api/health` for uptime checks.
- Server logs go to stdout and are collected by Vercel or `docker logs`.
- Client errors surface through the Next.js error boundary.
