# Changelog

Format loosely follows Keep a Changelog. Nothing is released yet.

## Unreleased

### Added
- Landing page, marketing pages (`/agents`, `/how-it-works`, `/demo`, `/docs`, `/api-reference`, `/pricing`, `/security`, `/changelog`).
- Dashboard: overview, projects, tasks, agents, git log, flow, exports, settings.
- JSON API: health, openapi, stats, stack, agents, projects, run, tasks, gitlog, export.
- Drizzle + libSQL storage with automatic table creation and seed data.
- Optional Clerk sign-in (email + GitHub) with demo-mode fallback.
- Browser-side project export (ZIP, no extra library).
- Docker image, `docker-compose.yml`, CI, CodeQL, GitHub Pages workflow, Dependabot, CodeRabbit config.
- Docs: RUN-ME, EXPLAIN-LIKE-IM-5, COMMANDS, WORKFLOWS, CODE-TOUR; premium README; CONTRIBUTING.

### Known gaps
- Agents are simulated, not real AI calls.
- No Playwright specs yet; `npm run test:e2e` is a placeholder.
- No `LICENSE` file yet.
