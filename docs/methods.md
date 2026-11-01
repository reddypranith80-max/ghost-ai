# Methods

## API (JSON)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/health` | - | health payload |
| GET | `/api/projects` | - | `Project[]` |
| POST | `/api/projects` | `ProjectInput` (name 2-60, brief 10-2000, stack 1-20) | `Project`; 400 on Zod failure |
| GET | `/api/projects/:id` | - | `ProjectDetail` (tasks, gitlog, agents); 404 if missing |

Project routes require a Clerk session unless demo mode is on.

## Internal methods
- `ProjectInput.parse / safeParse`: request validation (contracts.ts).
- Data-access layer (Drizzle): list projects, create project, get project detail (joins tasks and gitlog).
- Agent state derivation: `working` if the agent owns a `running` task, `done` if all its tasks are done, otherwise `idle`.
- Mock data provider: seeded `ProjectDetail` objects in demo mode.
