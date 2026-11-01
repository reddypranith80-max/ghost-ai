# Multi-agent orchestration

Ghost AI was built the way it describes itself: by a team of role-specialised agents coordinated by one orchestrator. This chapter explains that arrangement, using only what the repository records.

## The orchestrator and the role agents

One orchestrating session owned the plan, the contracts and `STATUS.md` (the code tour calls `STATUS.md` "owned by the orchestrator"). Work was delegated to role agents, each with a narrow remit. The roster below is the project's own, from `docs/agents.md`, and it is the same roster the product shows to its users.

{{gen:roles_table}}

Two rules from `docs/agents.md` shaped the whole build:

1. **Each agent edits only the files it owns.** This is what makes parallel work safe: the Frontend agent does not touch `src/app/api`, the Docs agent does not touch `src/**`, and the DevOps agent owns the Dockerfile, workflows and build scripts. (The book you are reading was written under the same rule: its generator may only create `scripts/build-book.mjs` and files under `docs/book/`.)
2. **Every agent ends with a structured report**: status (done, partial or blocked), what it did, files, tests run, risks and next steps. The orchestrator reads reports, not diffs, and records the verified facts in `STATUS.md`.

## Contracts first

The Architect's first deliverable is the contract that every other agent codes against. In this repository that is `src/lib/contracts.ts` (Zod schemas and shared types: `ProjectInput`, `Project`, `Task`, `GitLog`, `AgentState`, `ProjectDetail`, `Stats`) together with the agent catalogue in `src/lib/agent-catalog.ts`, the stack catalogue, and the mock data. `docs/context.md` names `contracts.ts` as the source of truth. Backend, Frontend and QA all import from it, so type errors rather than meetings catch disagreements, and `tsc --noEmit` is the integration check.

## The pipeline, as a product and as a process

The product brief defines the flow graph: *Architect, then Backend and Frontend, then DevOps and QA, then Security, then Reviewer.* The build followed the same shape:

| Stage | Agents | Repository evidence |
|---|---|---|
| Plan | Architect | `docs/product-brief.md`, `docs/adr/0001-stack.md`, `src/lib/contracts.ts`, `src/lib/mock-data.ts` |
| Build | Backend, Frontend | `src/db`, `src/lib/repo.ts`, `src/app/api/**`; landing, marketing and dashboard components |
| Ship and test | DevOps, QA | `Dockerfile`, `.github/workflows/*`, `scripts/*`; `tests/e2e/*`, `playwright.config.ts` |
| Harden | Security | `src/proxy.ts`, rate limiting in `src/lib/api-utils.ts`, CodeQL workflow, `npm audit` job |
| Explain | Docs | `README.md`, `docs/*` |
| Sign off | Reviewer | `.coderabbit.yaml`, PR template, CODEOWNERS |

## Sub-agents ("side agents")

Each lead agent in `src/lib/agent-catalog.ts` has three sub-agents with their own names and one-line roles. They appear in the product as the cards you expand on the landing page, `/agents/[slug]`, and the dashboard's Agents view, and they are what the `Task.subAgent` column refers to. The full table, generated from the catalogue:

{{gen:subagent_table}}

## Commits as the audit trail

`docs/logs.md` fixes the commit format as Conventional Commits (`type(scope): summary`) and says real agent commits carry `Co-Authored-By` trailers. The history in the next chapter follows that. The multi-agent nature of the work is visible in the commit titles themselves: "checkpoint multi-agent build (phase 1 in progress)", then "phase 1 agents output", then the QA, DevOps and Docs deliverables landing as separate commits.

## What orchestration did not solve

Parallel agents sharing one working directory are not isolated, and Chapter 4 documents the consequences: a build script run by one agent moved files another agent was editing, and file locks on a OneDrive-synced `.next` folder broke builds. The fixes (a lock directory in `scripts/pages-build.mjs`, documentation of the OneDrive problem) are small, but the lesson is structural: agents need separate worktrees or explicit locks for any tool that mutates shared paths.
