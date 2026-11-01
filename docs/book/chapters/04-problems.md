# Problems hit and how they were solved

This chapter is deliberately blunt. Each entry gives the symptom, the cause, the fix, and where the fix lives in the repository so you can verify it. Where a fact comes from the repository itself (a code comment, a commit message, a troubleshooting table) it is marked **Evidence**. Where it comes from the build agents' own account and the original console output is not preserved in the repository, it is marked **Reported**, and the explanation of the cause should be read as the best available account, not a forensic reconstruction.

## 1. The serif-font fallback (a CSS variable cycle)

**Symptom.** Headings and body text rendered in the browser's default serif font instead of Inter and Space Grotesk, even though the fonts loaded.

**Cause.** The shadcn/Tailwind starter maps theme font tokens in `@theme inline` (for example `--font-sans: var(--font-sans)`), while `next/font` can publish its own CSS variable under the very same name. A custom property that refers to itself is a cycle; the browser treats it as invalid at computed-value time, the `font-family` declaration is dropped, and the default (serif) face is used. **Reported.**

**Fix.** The `next/font` variables were given names that cannot collide with the theme tokens, and the theme tokens refer to them. In `src/app/layout.tsx`: `Space_Grotesk({ variable: "--font-grotesk" })`, `Inter({ variable: "--font-body" })`, `JetBrains_Mono({ variable: "--font-code" })`. In `src/app/globals.css`: `--font-sans: var(--font-body), ...`, `--font-display` and `--font-heading: var(--font-grotesk), ...`, `--font-mono: var(--font-code), ...`. **Evidence** (the resulting code; both files are listed in Part III). The Playwright suite checks for console errors on 21 pages but does not assert computed fonts, so this fix is covered by inspection only.

## 2. Clerk uses server actions, which cannot be statically exported

**Symptom.** The GitHub Pages build (`output: "export"`) failed or produced a broken site as soon as `ClerkProvider` was in the tree.

**Cause.** Clerk's Next.js integration relies on server actions and dynamic request APIs, neither of which exist in a fully static export. **Evidence:** the comment in `src/components/auth-provider.tsx`: "Required lazily so the static demo build never bundles Clerk (it uses server actions)."

**Fix.** Clerk became strictly optional and lazily loaded. `AUTH_ENABLED` is true only when a publishable key exists and `NEXT_PUBLIC_DEMO` is not `"1"`. When disabled, `AuthProvider` returns its children untouched and `require("@clerk/nextjs")` is never executed, so the bundler never pulls Clerk in. The same lazy pattern is used in `src/components/auth/*` and `src/lib/auth.ts`, which does a dynamic `import("@clerk/nextjs/server")`. The sign-in and sign-up routes export `generateStaticParams` so their optional catch-all segments can be exported, and in demo mode they render an explainer with a "Continue in demo mode" button instead of Clerk's form. The dashboard, its API calls and its data all work without Clerk.

## 3. Cache Components and partial prerendering are unsupported in a static export

**Symptom.** Enabling the Next.js 16 `cacheComponents` and `partialPrefetching` options for the server build made the static export fail.

**Cause.** Partial Prerendering needs a server runtime to stream dynamic holes; a plain folder of HTML files has none. **Evidence:** the comment in `next.config.ts`: "PPR features are unsupported in static export (GitHub Pages demo)."

**Fix.** The two options are conditional: `cacheComponents: !isPages` and `partialPrefetching: !isPages`, where `isPages` is `GITHUB_PAGES === "true"`. The normal and Docker builds keep the features; only the Pages build turns them off. API routes that read request data call `connection()` from `next/server` (see `src/app/api/projects/route.ts`) so they opt into dynamic rendering explicitly.

## 4. Static export on Windows requests prefetch files that were written in the wrong place

**Symptom.** On a Windows machine the exported site loaded, but client navigation requested files such as `__next.dashboard.tasks.__PAGE__.txt` that did not exist.

**Cause.** Next.js writes segment-prefetch files as nested paths (`__next.dashboard/tasks/__PAGE__.txt`) because `path.join` produces backslashes on Windows, but the browser requests the flat dotted name. On Linux the framework emits the flat names itself. **Evidence:** the header comment of `scripts/fix-win-export.mjs`.

**Fix.** `scripts/fix-win-export.mjs` walks the output folder, moves each nested file to the flat dotted name, and removes the emptied directory. It is a no-op on Linux (so CI is unaffected) and `scripts/pages-build.mjs` runs it after a successful export. `scripts/static-smoke.mjs` was added in the same commit (`cc54900`, "flatten static-export segment files on Windows; add static smoke test") to prove the exported site loads under the `/ghost-ai/` base path without console errors.

## 5. A concurrent Pages build deleted `src/app/api`

**Symptom.** The API routes vanished from the working tree in the middle of the build; a later commit message calls it out: "api routes restored" (commit `3f85f45`).

**Cause.** The static build cannot export route handlers or the Clerk proxy, so `scripts/pages-build.mjs` temporarily moves `src/app/api` and `src/proxy.ts` into a `.pages-stash` folder and restores them in a `finally` block. When two builds ran at once, the second run found the API already stashed, moved nothing, and then deleted the stash directory on exit, destroying the first run's only copy. **Evidence:** the comment in `scripts/pages-build.mjs`: "A second concurrent run would find the API already stashed, move nothing, then delete the stash."

**Fix.** A lock. The script now exits immediately with an explanatory message if `.pages-stash` exists, and only removes the stash after verifying every moved item has been put back. The recovery steps are in the RUN-ME troubleshooting table, `.pages-stash/` is in `.gitignore`, and the rule "Do not run `npm run build:pages` while `npm run dev` or another build is running in the same folder" was documented. The structural lesson is in Chapter 2.

## 6. `EPERM` on `.next` when the project lives in OneDrive

**Symptom.** `next dev` or `next build` failed with `EPERM`, `EBUSY` or "operation not permitted" while writing under `.next`.

**Cause.** The working folder is under OneDrive. The sync client and antivirus scan and lock files that Next.js is rewriting. **Evidence:** the RUN-ME troubleshooting table and the in-app guide in `src/components/marketing/guides.ts` ("EPERM on .next").

**Fix.** Stop running servers, delete `.next`, rebuild; best of all, move the project out of a synced folder. The Playwright tests and the demo recorder use a production build on dedicated ports (3500 for tests, 3501 for the recorder) so they do not compete with a dev server for `.next`.

## 7. Git Bash rewrote environment values that looked like paths

**Symptom.** Building the Pages site with `NEXT_PUBLIC_BASE_PATH=/ghost-ai` from Git Bash produced a base path like `C:/Program Files/Git/ghost-ai`, and asset URLs in the export were wrong.

**Cause.** MSYS (the layer under Git Bash) converts arguments and environment values that start with `/` into Windows paths. **Reported.** The repository's trace of this is the instruction in the header of `scripts/static-smoke.mjs`, which gives the PowerShell form `$env:NEXT_PUBLIC_BASE_PATH='/ghost-ai'; node scripts/pages-build.mjs` instead of a Bash one-liner.

**Fix.** Set such values from PowerShell or `cmd`, or in Git Bash disable conversion with `MSYS_NO_PATHCONV=1`. CI is unaffected because it runs on Linux, where `pages.yml` sets `NEXT_PUBLIC_BASE_PATH: /${{ github.event.repository.name }}`.

## 8. A linter that disagrees with Docker

`npx dockerfilelint Dockerfile` reports one "Invalid Argument Format" issue on the `HEALTHCHECK` line. The line uses `--start-period=20s`, an option Docker has supported since 17.09; the linter is an old tool that does not know it. The real output is kept in `docs/book/docker-lint.txt` and discussed in Part V. It is recorded here because "the linter said so" is exactly the kind of result that must be read, not obeyed.

## 9. Typecheck failed on a clean checkout

**Symptom.** `npm run typecheck` passed on the development machine but would fail in CI on a fresh clone.

**Cause.** `src/app/layout.tsx` typed its props with `LayoutProps<"/">`, a global type that Next.js generates into `.next/types` during `next dev` or `next build`. On a clean checkout those files do not exist yet. **Evidence:** commit `163c25f` ("make typecheck pass on clean checkout") and the one-line change in the layout.

**Fix.** The layout props are now typed as `{ children: React.ReactNode }`. The same commit gated CodeQL on public repositories, restricted `npm audit` to production dependencies and tracked `.env.example`. It is a reminder that "green locally" and "green in CI" are different claims until CI has actually run.

## The pattern behind the problems

Most incidents have the same shape: **a feature that needs a server (Clerk actions, PPR, route handlers, middleware) meets a deployment target that has none (static export), or a tool that mutates shared paths meets parallel actors (OneDrive, concurrent builds).** The repository's answers are a single switch (`GITHUB_PAGES` / `NEXT_PUBLIC_DEMO`) that selects the static variant, and explicit locks around anything that moves files.
