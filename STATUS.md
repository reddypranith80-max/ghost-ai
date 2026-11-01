# Project Status
**Current Goal**: Ship Ghost AI to GitHub with a live Pages demo.
**Overall Health**: GREEN locally; not yet pushed or deployed.
## Verified (with evidence)
- `tsc`, `eslint`, `next build` clean (47 static pages, 13 API routes, proxy)
- Playwright e2e on Edge: 55/55 pass (links, mobile menu, FAQ, dashboard views, wizard, drag/move, ZIP export CRC check, folder-save with stubbed picker, every API route incl. 400/404/409)
- Static GitHub Pages build works under /ghost-ai/ (Windows export bug fixed in scripts/fix-win-export.mjs)
- Demo video recorded: public/demo/ghost-ai-demo.webm (~11 MB, 89 s)
- Docs: RUN-ME, EXPLAIN-LIKE-IM-5, COMMANDS, WORKFLOWS, CODE-TOUR; 19 Mermaid diagrams parse
- Workflow YAML + .coderabbit.yaml validate against their schemas
## NOT verified
- Real Clerk sign-in (email + GitHub): needs owner's Clerk keys
- Docker image build (no Docker locally; CI job will test it)
- GitHub Actions runs, GitHub Pages deploy, CodeRabbit (needs push + app install)
- Browsers other than Edge; Linux static export
## Next
Owner supplies GitHub user/repo + Clerk keys -> push -> enable Pages (Actions) -> install CodeRabbit -> confirm live URL.
