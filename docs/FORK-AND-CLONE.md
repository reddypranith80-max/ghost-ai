# Fork and clone Ghost AI

Make your own copy, run it, change it, host your own live demo, and send improvements back. Commands assume a terminal with `git`, Node.js 20+ (24 recommended) and npm. Upstream repository: <https://github.com/reddypranith80-max/ghost-ai>.

How verified: workflow behaviour was read from `.github/workflows/*.yml`; commands come from `package.json`. Forking itself was not exercised from this repo.

## 1. Fork

**On GitHub (UI).** Open <https://github.com/reddypranith80-max/ghost-ai>, click **Fork** (top right), choose your account, keep the name `ghost-ai` (or pick another; see step 8), click **Create fork**.

**With the GitHub CLI (optional).**

```bash
gh repo fork reddypranith80-max/ghost-ai --clone
```

This forks, clones your fork and adds the `upstream` remote for you. If you used it, skip to step 3.

## 2. Clone your fork

Replace `YOUR-USER` with your GitHub username.

```bash
# HTTPS
git clone https://github.com/YOUR-USER/ghost-ai.git
# or SSH (needs an SSH key added to your GitHub account)
git clone git@github.com:YOUR-USER/ghost-ai.git

cd ghost-ai
```

You should see `package.json` in this folder.

## 3. Install and run

```bash
npm ci
npm run dev
```

Open <http://localhost:3000> and click **Dashboard**. No keys needed (demo mode). More modes (Clerk, Docker): [RUN-ME.md](RUN-ME.md).

## 4. Change something

1. Create a branch: `git checkout -b feat/my-change`.
2. Edit a file. A safe first change: the hero text in `src/app/page.tsx` or an agent tagline in `src/lib/agent-catalog.ts`. The dev server reloads automatically.
3. Check it like CI does:

```bash
npm run typecheck
npm run lint
npm run docs:check
npm run build
```

4. Commit with a Conventional Commit message: `git commit -am "feat(ui): new hero text"`.

Where things live: [CODE-TOUR.md](CODE-TOUR.md).

## 5. Keep your fork in sync with upstream

```bash
git remote add upstream https://github.com/reddypranith80-max/ghost-ai.git   # once
git remote -v                                                                  # origin = yours, upstream = original
git fetch upstream
git checkout main
git merge upstream/main          # or: git rebase upstream/main
git push origin main
```

Use `merge` if you are unsure; use `rebase` for a clean history on a branch nobody else uses. After syncing, run `npm ci` in case dependencies changed. On GitHub you can also click **Sync fork** on your fork's page.

## 6. Run the tests

```bash
npm run build
npm run test:e2e
```

The Playwright config uses the installed Microsoft Edge (`channel: "msedge"`). If you do not have Edge, either install it or change `channel` in `playwright.config.ts` (for example to `"chrome"`, or remove it and run `npx playwright install chromium`). The tests start their own server on port 3500.

## 7. Your own Clerk app (optional sign-in)

Skip this if demo mode is enough. Otherwise follow [auth.md](auth.md): create a Clerk app, enable Email and GitHub, copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. The project owner's keys are not in the repository and never will be.

## 8. Publish your own live demo on GitHub Pages

The workflow `.github/workflows/pages.yml` ("Deploy demo to GitHub Pages") builds a static copy of the app on every push to `main` and can be started manually.

1. On your fork open **Settings, then Pages**.
2. Under **Build and deployment, Source** choose **GitHub Actions**.
3. If Actions are disabled on your fork, open the **Actions** tab and click **I understand my workflows, go ahead and enable them**.
4. Push to `main` (or run the workflow from the Actions tab with **Run workflow**).
5. When it is green your site is at `https://YOUR-USER.github.io/YOUR-REPO-NAME/`.

You do not need to edit any base path. The workflow sets `NEXT_PUBLIC_BASE_PATH: /${{ github.event.repository.name }}`, so it uses your repository's name automatically, even if you renamed the fork.

The static demo has no API or database; it uses mock data in the browser.

## 9. Repository secrets

None are required. The workflows only use the built-in `GITHUB_TOKEN`. Clerk keys are only needed on your own machine or host (not in CI): never commit `.env.local`.

If you later deploy the full app somewhere (for example Vercel, see `vercel.json`), set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (and `DATABASE_URL` / `DATABASE_AUTH_TOKEN` for Turso) in that host's environment settings.

Optional apps: install [CodeRabbit](coderabbit.md) on your fork for AI pull request reviews.

## 10. Open a pull request upstream

```bash
git push origin feat/my-change
```

Then open your fork on GitHub and click **Compare and pull request**, or run `gh pr create --repo reddypranith80-max/ghost-ai`. Base repository: `reddypranith80-max/ghost-ai`, base branch `main`. Fill in the PR template, wait for CI and CodeRabbit, and answer review comments. Rules: [CONTRIBUTING.md](../CONTRIBUTING.md).

## Common fork problems

| Problem | Cause | Fix |
|---|---|---|
| Pages workflow fails at `configure-pages` | Pages source is not set to GitHub Actions | Settings, Pages, Source: GitHub Actions, then re-run |
| Live site shows unstyled page or 404 for assets | Built without the right base path (for example a local `out/` served from the root) | Let the workflow build it, or build with `NEXT_PUBLIC_BASE_PATH=/YOUR-REPO-NAME` |
| Workflows do not run on the fork | Actions disabled on forks by default | Enable them in the Actions tab |
| CodeQL job is skipped | Skipped on private repositories by design | Make the fork public, or ignore |
| `git push` rejected after syncing | Your branch and `origin/main` diverged | `git pull --rebase origin main`, then push |
| Merge conflicts when syncing | You changed the same lines as upstream | Resolve in your editor, `git add`, `git commit` (or `git rebase --continue`) |
| `npm ci` fails with a lockfile error | Edited `package.json` without updating the lock | Run `npm install` and commit `package-lock.json` |
| Sign-in does not work on your site | Clerk keys missing, or the static demo (which has no auth) | Add keys locally; the Pages demo is always demo mode |
| Playwright cannot find Edge | Edge not installed | See step 6 |
| Docker job fails in CI on a fork | Docker build cache or network issue | Re-run; the same build is `docker compose up --build` locally |
