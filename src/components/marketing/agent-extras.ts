import type { AgentName } from "@/lib/contracts";

export const AGENT_EXTRAS: Record<AgentName, { tasks: string[]; example: string; related: AgentName[]; eli5: string }> = {
  Architect: {
    tasks: ["Split the brief into modules", "Choose libraries for your stack", "Draft the database schema", "Write the OpenAPI contract", "Record decisions as ADRs"],
    example: "ADR-001: Use libSQL + Drizzle\nStatus: accepted\nContext: small team, edge-friendly, zero ops.\nDecision: Drizzle ORM over libSQL with typed migrations.\nConsequence: Backend can start from contracts.ts on day one.",
    related: ["Backend", "Frontend", "Docs"],
    eli5: "The architect draws the floor plan before anyone picks up a hammer.",
  },
  Backend: {
    tasks: ["Create tables and migrations", "Implement /api/projects routes", "Validate input with Zod", "Wire auth checks", "Seed demo data"],
    example: "feat(api): add POST /api/projects\n- Zod ProjectInput (name, brief, stack)\n- 201 + Project JSON, 400 on invalid input\n- 4 files changed",
    related: ["Architect", "Frontend", "QA"],
    eli5: "The backend is the kitchen: you never see it, but every dish comes from there.",
  },
  Frontend: {
    tasks: ["Build the dashboard layout", "Create the task board", "Add motion and transitions", "Make every page responsive", "Run accessibility checks"],
    example: "feat(ui): task board with status columns\n- TaskCard, ProgressBar, filter chips\n- keyboard focus rings, reduced-motion aware\n- 7 files changed",
    related: ["Architect", "Backend", "QA"],
    eli5: "The frontend is the shop window and the buttons you press.",
  },
  DevOps: {
    tasks: ["Write the CI workflow", "Build a Docker image", "Configure Vercel and Pages deploys", "Add health checks", "Document environment variables"],
    example: "ci: add build + typecheck + lint workflow\n- node 22, npm ci cache\n- deploy preview on every PR\n- 3 files changed",
    related: ["Backend", "Security", "QA"],
    eli5: "DevOps builds the road and the delivery truck so your app can reach people.",
  },
  QA: {
    tasks: ["Write end-to-end click tests", "Unit-test validation logic", "Check load and speed", "File reproducible bug reports", "Track coverage"],
    example: "test(e2e): create project from dashboard\n- fills brief + stack, expects 6 tasks to appear\n- coverage 82% -> 87%\n- 2 files changed",
    related: ["Frontend", "Backend", "Reviewer"],
    eli5: "QA is the person who presses every button twice, just to be sure.",
  },
  Security: {
    tasks: ["Scan dependencies", "Review who can call what", "Hunt for leaked secrets", "Set CSP headers", "Write a threat model"],
    example: "sec: add CSP + security headers\n- default-src 'self', frame-ancestors 'none'\n- npm audit: 0 high, 0 critical\n- 2 files changed",
    related: ["DevOps", "Backend", "Reviewer"],
    eli5: "Security checks the locks on every door and window before you move in.",
  },
  Docs: {
    tasks: ["Write the README", "Explain it like I'm five", "Document every endpoint", "Keep the changelog", "Draw Mermaid diagrams"],
    example: "docs: add API reference and quick start\n- 12 endpoints with curl + JSON examples\n- ELI5 summary of the pipeline\n- 4 files changed",
    related: ["Architect", "Reviewer", "Backend"],
    eli5: "Docs is the instruction manual that actually makes sense.",
  },
  Reviewer: {
    tasks: ["Review every pull request", "Enforce style and lint", "Check the definition of done", "Issue Go / No-Go", "List required fixes"],
    example: "VERDICT: GO\n- all 6 modules merged, CI green\n- 0 blocking findings, 2 nits\n- ready to ship",
    related: ["Security", "QA", "Docs"],
    eli5: "The reviewer is the teacher who checks the homework before it is handed in.",
  },
};
