# Every command

Run all commands from the folder that contains `package.json`. How verified: npm scripts are read from `package.json`; curl examples are read from `src/app/api/**` route code.

## 1. npm scripts

| Command | What it does | When to use | Expected result |
|---|---|---|---|
| `npm ci` | Installs exact versions from `package-lock.json` | First time, and after pulling changes to `package.json` | `added N packages` |
| `npm run dev` | `next dev`: development server with hot reload | Daily work | `Local: http://localhost:3000`, `Ready` |
| `npm run build` | `next build`: production build | Before pushing; CI runs it | Route list, exit 0 |
| `npm start` | `next start`: serves the production build | After `npm run build` | Server on port 3000 |
| `npm run lint` | `eslint` | Before every commit | No errors |
| `npm run lint:fix` | `eslint --fix`: auto-fixes what it can | When lint complains about style | Fewer or zero errors |
| `npm run typecheck` | `tsc --noEmit`: type errors only, no files written | Before every commit | No output, exit 0 |
| `npm run build:pages` | `node scripts/pages-build.mjs`: static export to `out/` (moves `src/app/api` and `src/proxy.ts` away, then restores) | Test the GitHub Pages demo | `out/` folder created |
| `npm run docs:check` | `node scripts/check-mermaid.mjs --no-render`: parses every Mermaid block in `README.md` and `docs/**/*.md` | After editing any doc with a diagram; CI runs it | Every block OK |
| `npm run docs:diagrams` | `node scripts/check-mermaid.mjs`: same, and renders SVGs to `docs/diagrams/` (needs Edge/Chrome; set `PUPPETEER_EXECUTABLE_PATH` if not found) | When you want fresh SVG pictures | SVG files updated |
| `npm run test:e2e` | Placeholder: prints `e2e tests not configured yet`, exits 0 | Not useful yet | That message |
| `npm run docker:build` | `docker build -t ghost-ai-web:local .` | Build the image | Image `ghost-ai-web:local` |
| `npm run docker:up` | `docker compose up --build` | Run in Docker | Site on http://localhost:3000 |

Pass extra flags to Next after `--`: `npm run dev -- -p 3001` (use port 3001).

Set an env var for one run:

| System | Example |
|---|---|
| Mac / Linux | `NEXT_PUBLIC_DEMO=1 npm run dev` |
| Windows PowerShell | `$env:NEXT_PUBLIC_DEMO="1"; npm run dev` |
| Windows cmd | `set NEXT_PUBLIC_DEMO=1 && npm run dev` |

## 2. Git workflow

```bash
git checkout -b feat/short-name            # new branch (never work on main)
git status                                 # see what changed
git add path/to/file                       # stage chosen files
git commit -m "feat(api): add project detail route"
git push -u origin feat/short-name         # first push of the branch
```

Then open a Pull Request on GitHub (`gh pr create` if you use the GitHub CLI). See [WORKFLOWS.md](WORKFLOWS.md#pr-lifecycle).

Commit message format (Conventional Commits, from [logs.md](logs.md)): `type(scope): summary`

Types: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`.

Before pushing run: `npm run typecheck && npm run lint && npm run build` (the PR template asks for this). On Mac/Linux/Git Bash `&&` works; in Windows PowerShell 5 run them one per line.

## 3. Docker

| Command | What it does |
|---|---|
| `npm run docker:build` | Build image `ghost-ai-web:local` |
| `docker compose up --build` (or `npm run docker:up`) | Build and run on port 3000, data in volume `ghost-data` |
| `docker compose up -d` | Run in background |
| `docker compose logs -f web` | Follow logs |
| `docker compose down` | Stop and remove the container (data stays) |
| `docker compose down -v` | Also delete the data volume |
| `docker run -d --name ghost -p 3000:3000 ghost-ai-web:local` | Run the image directly (what CI does with tag `ghost-ai-web:ci`) |
| `docker exec ghost id -u` | Shows the user id inside; must not be `0` (non-root) |
| `docker logs ghost` | Container logs |
| `docker rm -f ghost` | Remove that container |

The image has a built-in `HEALTHCHECK` on `/api/health`.

## 4. Playwright

`@playwright/test` is a dev dependency, but **there are no test files and no `playwright.config` in the repo yet**, and `npm run test:e2e` is a placeholder. Once someone adds specs, these standard Playwright commands apply:

| Command | What it does |
|---|---|
| `npx playwright install chromium` | Download the test browser (one time) |
| `npx playwright test` | Run all tests |
| `npx playwright test --ui` | Interactive mode |
| `npx playwright show-report` | Open the last HTML report |

Until then the manual test is: `npm run dev`, click through `/dashboard` (New project, Run next step, Exports).

## 5. API examples (curl)

Server must be running (`npm run dev`). `$B` below means `http://localhost:3000`. Seeded sample project ids: `demo-1` (Nebula CRM) and others. Responses are JSON. Errors look like `{"error":{"code":"...","message":"..."}}`.

| Method and path | Purpose | Example |
|---|---|---|
| `GET /api/health` | Is it alive? DB up? (503 if DB down) | `curl http://localhost:3000/api/health` |
| `GET /api/openapi` | OpenAPI 3.1 document | `curl http://localhost:3000/api/openapi` |
| `GET /api/stats` | Totals for visible projects | `curl http://localhost:3000/api/stats` |
| `GET /api/stack` | Stack catalog by category | `curl http://localhost:3000/api/stack` |
| `GET /api/agents` | The 8 agents with sub-agents | `curl http://localhost:3000/api/agents` |
| `GET /api/agents/:name` | One agent, case-insensitive | `curl http://localhost:3000/api/agents/architect` |
| `GET /api/projects` | List projects | `curl http://localhost:3000/api/projects` |
| `POST /api/projects` | Create (name 2-60, brief 10-2000, stack 1-20 items); 201 | see below |
| `GET /api/projects/:id` | One project with tasks, gitlog, agents; 404 if missing | `curl http://localhost:3000/api/projects/demo-1` |
| `DELETE /api/projects/:id` | Delete (403 if read-only sample or not yours) | `curl -X DELETE http://localhost:3000/api/projects/<id>` |
| `POST /api/projects/:id/run` | Advance the simulated pipeline one step; 409 when all done | `curl -X POST http://localhost:3000/api/projects/demo-1/run` |
| `GET /api/projects/:id/tasks` | List tasks, filters `status`, `module`, `agent` | `curl "http://localhost:3000/api/projects/demo-1/tasks?status=running&agent=frontend"` |
| `PATCH /api/projects/:id/tasks/:taskId` | Set `status` and/or `progress` (0-100; `done` needs 100) | see below |
| `GET /api/projects/:id/gitlog` | Commits newest first, filters `limit` (1-500), `agent` | `curl "http://localhost:3000/api/projects/demo-1/gitlog?limit=5"` |
| `GET /api/projects/:id/export` | Download; `format=json` (default) or `md` | `curl -OJ "http://localhost:3000/api/projects/demo-1/export?format=md"` |

Create a project (Mac/Linux/Git Bash):

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Toy Shop","brief":"A small shop to sell toys online.","stack":["Next.js","Drizzle"]}'
```

Windows PowerShell:

```powershell
curl.exe -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -d '{\"name\":\"Toy Shop\",\"brief\":\"A small shop to sell toys online.\",\"stack\":[\"Next.js\",\"Drizzle\"]}'
```

Update a task:

```bash
curl -X PATCH http://localhost:3000/api/projects/<id>/tasks/<taskId> \
  -H "Content-Type: application/json" -d '{"status":"done","progress":100}'
```

Notes:

- Write routes (POST, PATCH, DELETE) allow 60 requests per minute per IP, then answer 429.
- With Clerk keys set, writes to `/api/projects*` without a session return 401 (`src/proxy.ts`). Reads stay public.
- All routes answer `OPTIONS` with CORS headers (`*`).

## 6. Environment variables

Defined in `.env.example`; copy to `.env.local` for local use.

| Name | Required | Used by | Meaning |
|---|---|---|---|
| `DATABASE_URL` | no | `src/db/index.ts` | libSQL URL. Default `file:local.db`. Docker sets `file:/data/local.db`. Use a Turso `libsql://...` URL for hosted. |
| `DATABASE_AUTH_TOKEN` | only for Turso | `src/db/index.ts` | Token for remote libSQL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | for sign-in | auth-provider, proxy, health | Clerk frontend key |
| `CLERK_SECRET_KEY` | for sign-in | Clerk server code | Clerk backend key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | no | Clerk | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | no | Clerk | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | no | Clerk | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | no | Clerk | `/dashboard` |
| `NEXT_PUBLIC_DEMO` | no | auth-provider, proxy, client-data | `1` = no Clerk, no API calls, browser mock data |
| `GITHUB_PAGES` | build only | `next.config.ts` | `true` = static export (set by `build:pages` / pages.yml) |
| `NEXT_PUBLIC_BASE_PATH` | Pages only | `next.config.ts`, marketing UI | e.g. `/<repo>` |
| `DOCKER` | build only | `next.config.ts` | `1` = standalone output (set in Dockerfile) |
| `PORT`, `HOSTNAME` | Docker | Dockerfile | `3000`, `0.0.0.0` |
| `PUPPETEER_EXECUTABLE_PATH` | optional | `docs:diagrams` | Path to Edge/Chrome for rendering |

Never commit real keys. `.env*` files are for your machine only.
