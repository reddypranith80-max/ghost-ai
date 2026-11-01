# Contributing

Thanks for helping. Start with [docs/RUN-ME.md](docs/RUN-ME.md) to get the app running.

## Steps

1. Branch from `main`: `git checkout -b feat/short-name`.
2. Make a small, focused change. Keep to the folder you own if you are an agent (see [docs/agents.md](docs/agents.md)).
3. Check everything, same as CI:
   ```bash
   npm run typecheck
   npm run lint
   npm run docs:check
   npm run build
   ```
4. Commit with Conventional Commits: `type(scope): summary`, for example `fix(api): return 404 for missing task`. Types: feat, fix, docs, chore, ci, refactor, test.
5. Push and open a pull request. Fill in the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
6. Answer CodeRabbit comments and wait for CI to turn green. See [docs/WORKFLOWS.md](docs/WORKFLOWS.md).

## Rules of thumb

- No secrets in git. If you add an environment variable, add it to `.env.example` and the table in [docs/COMMANDS.md](docs/COMMANDS.md).
- Validate API input with Zod (`src/lib/contracts.ts`) and think about auth.
- Changing docs with Mermaid diagrams? Run `npm run docs:check`.
- Do not run two builds (`npm run build`, `npm run build:pages`, `npm run dev`) in the same folder at the same time.
- This Next.js version is new. Read `node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`).

All commands are listed in [docs/COMMANDS.md](docs/COMMANDS.md).
