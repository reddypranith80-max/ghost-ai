# Run Ghost AI in 5 minutes

This page is for a complete beginner. Copy each command, paste it into a terminal, press Enter. After every step you will see what the screen should say.

> Every command here exists in `package.json` or is a standard tool command. Nothing is made up.

## 0. What is a "terminal"?

A text window where you type commands.

| System | How to open it |
|---|---|
| Windows | Press the Windows key, type `PowerShell`, press Enter |
| Mac | Press Cmd+Space, type `Terminal`, press Enter |
| Linux | Press Ctrl+Alt+T |

## 1. Install the tools (one time)

| Tool | Needed? | Get it | Check it worked |
|---|---|---|---|
| Node.js 20 or newer (24 recommended; CI and Docker use 24) | yes | https://nodejs.org (pick "LTS" or the newest) | `node -v` prints `v20...` or higher |
| git | yes (to download the code) | https://git-scm.com/downloads | `git --version` prints a version |
| Docker Desktop | only for Mode C | https://www.docker.com/products/docker-desktop | `docker --version` prints a version |

`npm` comes with Node. Check: `npm -v` prints a number.

## 2. Get the code

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>
```

(`<user>/<repo>` is a placeholder: use the real address of your copy of this project. The Next.js app lives in the folder that contains `package.json`; if your repo has a `web/` folder, run `cd web` too.)

You should see: `Cloning into '<repo>'...` then your prompt in the new folder. Check with `ls` (Mac/Linux) or `dir` (Windows): you should see `package.json`.

## 3. Install the packages

```bash
npm ci
```

Expected: a progress bar, then something like `added NNN packages`. Takes 1-3 minutes. (`npm ci` installs exactly what `package-lock.json` says, the same as CI does.)

## Mode A: zero-config demo mode (start here)

No accounts. No keys. No settings. The database file `local.db` is created by itself the first time the API is used.

```bash
npm run dev
```

Expected output (version numbers may differ):

```text
▲ Next.js 16.x
- Local:  http://localhost:3000
✓ Ready in ...
```

Now open **http://localhost:3000** in your browser.

What you should see:

1. A dark landing page with the Ghost AI logo and a hero section.
2. Click **Dashboard** (or go to http://localhost:3000/dashboard). With no Clerk keys the dashboard is open to everyone.
3. Two sample projects are already there (they are seeded into `local.db` on first use).
4. Click **New project**, type a name, a goal of at least 10 characters, pick a stack, create it.
5. Click **Run next step** a few times. Tasks move todo, running, review, done and commits appear.
6. Open **Exports** in the side menu to download the project as a ZIP.

Stop the server: press **Ctrl+C** in the terminal.

Want the app to use only browser mock data and never call the API? Force demo:

| System | Command |
|---|---|
| Mac / Linux | `NEXT_PUBLIC_DEMO=1 npm run dev` |
| Windows PowerShell | `$env:NEXT_PUBLIC_DEMO="1"; npm run dev` |

## Mode B: with Clerk (email + GitHub sign-in)

Clerk is an outside service that handles sign-in. You need your own free Clerk account; the project owner's keys are not in the repo.

1. Make an app at https://dashboard.clerk.com.
2. Copy the example settings file:
   - Mac / Linux: `cp .env.example .env.local`
   - Windows PowerShell: `Copy-Item .env.example .env.local`
3. Open `.env.local` and fill in these two lines with your keys (the rest can stay):
   ```text
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. In Clerk turn on **Email address** and add the **GitHub** connection. Details: [auth.md](auth.md).
5. Stop the server (Ctrl+C) and start again: `npm run dev`.
6. Open http://localhost:3000/dashboard. You should be sent to `/sign-in`. After signing in you land on `/dashboard`.

Always use `http://localhost:3000` (not a LAN IP) with development keys.

## Mode C: Docker

Needs Docker Desktop running.

```bash
docker compose up --build
```

(Same as `npm run docker:up`.) The first build takes a few minutes. Expected last lines: the `web` container starts and Next.js says it is ready. Open http://localhost:3000. Check health:

```bash
curl http://localhost:3000/api/health
```

Expected: JSON like `{"ok":true,"db":"up","version":"0.1.0",...,"authEnabled":false,...}`.

Data is kept in the Docker volume `ghost-data`. To use Clerk, put the keys in a `.env` file next to `docker-compose.yml` (compose reads it if present). Stop with Ctrl+C, or `docker compose down` (add `-v` to also delete the data).

Just build the image without running: `npm run docker:build` (makes `ghost-ai-web:local`).

## Run the checks (what CI runs)

```bash
npm run typecheck     # TypeScript errors? expected: no output, exit code 0
npm run lint          # code style. expected: no output / no errors
npm run docs:check    # Mermaid diagrams in the docs parse. expected: all OK
npm run build         # production build. expected: route table, no errors
```

Tests: `npm run test:e2e` currently only prints `e2e tests not configured yet` and exits 0. `@playwright/test` is installed but there are no spec files or `playwright.config` yet. See [COMMANDS.md](COMMANDS.md#playwright).

## Build the static GitHub Pages demo

```bash
npm run build:pages
```

This temporarily moves `src/app/api` and `src/proxy.ts` aside (a static site cannot have a server), builds, and puts them back. Output goes to the `out/` folder. To look at it locally:

```bash
npx serve out
```

(`serve` is downloaded on demand by npx; then open the address it prints.) If you set a base path for a project site, also set `NEXT_PUBLIC_BASE_PATH=/<repo>` when building, like `.github/workflows/pages.yml` does.

Do not run `npm run build:pages` while `npm run dev` or another build is running in the same folder.

## Something went wrong?

| Symptom | Why | Fix |
|---|---|---|
| `EPERM`, `EBUSY` or "operation not permitted" on `.next` (common when the folder is inside OneDrive) | OneDrive or antivirus is syncing/locking files that Next.js is trying to rewrite | Stop the dev server. Delete `.next` (`rm -rf .next` or `Remove-Item -Recurse -Force .next`). Best: move the project out of OneDrive (for example `C:\dev\ghost-ai`) or pause OneDrive syncing. Then `npm run dev` again. |
| `Port 3000 is in use` / `EADDRINUSE` | Another program (maybe an old dev server) uses 3000 | Stop the other one, or use another port: `npm run dev -- -p 3001` and open http://localhost:3001 |
| Clerk says `Invalid host` or sign-in will not load | Development keys only work on `localhost`; or the key is wrong | Open `http://localhost:3000` exactly. Re-copy both keys. Restart the server. More in [auth.md](auth.md). |
| Page is blank or white | Dev server still compiling, a crashed build, or stale cache | Wait for `✓ Ready`. Hard-refresh (Ctrl+Shift+R). Look at the terminal for red errors. Try deleting `.next` and restarting. |
| Dashboard shows sample data but never saves to the server | It fell back to browser demo mode because `/api/health` did not answer, or `NEXT_PUBLIC_DEMO=1` is set | Make sure the server is running and `curl http://localhost:3000/api/health` works. Unset `NEXT_PUBLIC_DEMO`. |
| `database is locked` / `SQLITE_BUSY` | Two processes use the same `local.db` | Stop the extra server. Then restart. If still stuck: stop everything and delete `local.db` (you lose local projects; it is recreated and re-seeded). |
| `Unsupported engine` / `SyntaxError` / strange errors on install | Node is too old | `node -v` must be v20 or higher (24 recommended). Install a newer Node, delete `node_modules`, run `npm ci` again. |
| Keys are set but the app still acts like demo mode | `NEXT_PUBLIC_DEMO=1` is set, or the server was not restarted | Remove the variable, restart `npm run dev`. |
| `docker: command not found` / cannot connect to daemon | Docker not installed or not running | Start Docker Desktop, wait for the whale icon to be steady, retry. |
| `npm run build:pages` says `.pages-stash exists` | A previous Pages build crashed halfway | Move the contents of `.pages-stash/` back into `src/` (`api` to `src/app/api`, `proxy.ts` to `src/proxy.ts`), delete `.pages-stash`, retry. |

Still stuck? Open an issue (template in `.github/ISSUE_TEMPLATE`) and paste the terminal text.

Next: [EXPLAIN-LIKE-IM-5.md](EXPLAIN-LIKE-IM-5.md) to understand it, [COMMANDS.md](COMMANDS.md) for every command.
