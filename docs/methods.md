# Methods

## API (JSON)
Full examples: [COMMANDS.md](COMMANDS.md#5-api-examples-curl). Live OpenAPI document: `GET /api/openapi`.

| Method | Path | Body / query | Response |
|---|---|---|---|
| GET | `/api/health` | - | health payload (503 if DB down) |
| GET | `/api/openapi` | - | OpenAPI 3.1 JSON |
| GET | `/api/stats` | - | totals across visible projects |
| GET | `/api/stack` | - | stack catalog by category |
| GET | `/api/agents` | - | 8 agents with sub-agents |
| GET | `/api/agents/:name` | - | one agent (case-insensitive); 404 if unknown |
| GET | `/api/projects` | - | `ProjectDetail[]` |
| POST | `/api/projects` | `ProjectInput` (name 2-60, brief 10-2000, stack 1-20) | 201 `ProjectDetail`; 400 on Zod failure |
| GET | `/api/projects/:id` | - | `ProjectDetail`; 404 if missing |
| DELETE | `/api/projects/:id` | - | `{ ok, id }`; 403 read-only, 404 |
| POST | `/api/projects/:id/run` | - | advances the simulated pipeline one step; 409 when all done |
| GET | `/api/projects/:id/tasks` | `status`, `module`, `agent` | `Task[]` |
| PATCH | `/api/projects/:id/tasks/:taskId` | `status` and/or `progress` (0-100) | updated `ProjectDetail` |
| GET | `/api/projects/:id/gitlog` | `limit` (1-500), `agent` | `GitLog[]`, newest first |
| GET | `/api/projects/:id/export` | `format=json\|md` | file download |

Write routes are rate limited (60 per minute per IP, then 429). With Clerk enabled, writes to `/api/projects*` need a session (401 otherwise); reads stay public.

## Internal methods
- `ProjectInput.parse / safeParse`: request validation (`src/lib/contracts.ts`).
- `src/lib/repo.ts`: the data-access layer (Drizzle): `listProjects`, `getProject`, `createProject`, `deleteProject`, `advancePipeline`, `updateTask`, `projectStats`. Seeds sample data once.
- Agent state derivation: `working` if the agent owns a `running` or `review` task, `done` if all its tasks are done, otherwise `idle`.
- `src/lib/sim.ts` + `src/lib/mock-data.ts`: the browser-side simulation and sample data used in demo mode.
