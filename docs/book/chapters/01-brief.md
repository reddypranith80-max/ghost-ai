# The product brief

Ghost AI is a web application where you give a goal and a technology stack, and a crew of specialised agents plans, builds, reviews and ships a software-as-a-service product while you watch. The pitch fits in one sentence: *one place to feed in a goal and a stack, and watch agents plan tasks, split modules, commit code and ship.*

The brief below is the project's own, taken verbatim from `docs/product-brief.md`.

{{doc:docs/product-brief.md}}

## What the brief turned into

The six core features in the brief map directly onto routes and files that exist in the repository today:

| Brief item | Where it lives |
|---|---|
| Create a project from brief and stack | `/dashboard/projects` plus the three-step wizard in `src/components/dashboard/new-project-wizard.tsx`; `POST /api/projects` on the server side |
| Agent roster with live status | `/dashboard/agents`, `src/components/dashboard/agents.tsx`; `AgentState` derived in `src/lib/repo.ts` |
| Task board by module | `/dashboard/tasks`, `src/components/dashboard/tasks.tsx` (kanban with drag and drop) |
| Git-log timeline of agent commits | `/dashboard/git`, `src/components/dashboard/gitlog.tsx`; `GET /api/projects/:id/gitlog` |
| Flow graph of the pipeline | `/dashboard/flow`, `src/components/dashboard/flow.tsx` |
| Auth (Clerk) with demo-mode fallback | `src/components/auth-provider.tsx`, `src/proxy.ts`, `src/lib/auth.ts` |

Beyond the brief, the build added an `exports` view that bundles a generated project as a ZIP in the browser, a marketing site (agents, how-it-works, demo, docs, API reference, pricing, security, changelog), and a full DevOps surface (Docker, CI, CodeQL, Pages, Dependabot, CodeRabbit).

## Honest scope

The agents inside the product are a *simulation*: `src/lib/sim.ts` advances tasks through `todo`, `running`, `review` and `done` deterministically and invents plausible log lines and commits. No model is called at runtime. The project's own changelog lists this under "Known gaps". What is real is the product shell around that simulation: the data model, the API with validation, rate limiting and optional authentication, the dashboard, the export bundle, the tests and the delivery pipeline.

## The demo, as recorded

The repository includes a recorded product tour (`public/demo/ghost-ai-demo.webm`, about 89 seconds, produced by `scripts/record-demo.mjs`). Its poster frame:

![Poster frame of the recorded demo video](../../public/demo/poster.png)
