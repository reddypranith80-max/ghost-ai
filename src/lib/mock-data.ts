import type { ProjectDetail } from "./contracts";

export const MOCK_PROJECTS: ProjectDetail[] = [
  {
    id: "demo-1", name: "Nebula CRM", brief: "A CRM SaaS with pipelines, billing and team roles.",
    stack: ["Next.js","shadcn/ui","Clerk","Drizzle","Stripe"], status: "building", createdAt: "2026-10-30T09:00:00Z",
    tasks: [
      { id: "t1", projectId: "demo-1", title: "System design + ADRs", module: "Core", agent: "Architect", status: "done", progress: 100 },
      { id: "t2", projectId: "demo-1", title: "Auth & RBAC", module: "Auth", agent: "Backend", status: "done", progress: 100 },
      { id: "t3", projectId: "demo-1", title: "Pipeline board UI", module: "CRM", agent: "Frontend", status: "running", progress: 64 },
      { id: "t4", projectId: "demo-1", title: "CI/CD + Docker", module: "Infra", agent: "DevOps", status: "running", progress: 40 },
      { id: "t5", projectId: "demo-1", title: "E2E happy path", module: "CRM", agent: "QA", status: "todo", progress: 0 },
      { id: "t6", projectId: "demo-1", title: "Threat model", module: "Auth", agent: "Security", status: "review", progress: 90 },
    ],
    gitlog: [
      { id: "g1", projectId: "demo-1", hash: "a1f93c2", message: "feat(arch): ADR-001 stack selection", agent: "Architect", files: 3, at: "2026-10-30T09:10:00Z" },
      { id: "g2", projectId: "demo-1", hash: "b72e0d1", message: "feat(auth): clerk middleware + roles", agent: "Backend", files: 6, at: "2026-10-30T10:02:00Z" },
      { id: "g3", projectId: "demo-1", hash: "c8d4417", message: "feat(ui): pipeline kanban", agent: "Frontend", files: 8, at: "2026-10-30T11:30:00Z" },
      { id: "g4", projectId: "demo-1", hash: "d09ab55", message: "ci: github actions + dockerfile", agent: "DevOps", files: 4, at: "2026-10-30T12:15:00Z" },
    ],
    agents: [
      { name: "Architect", status: "done", currentTask: null }, { name: "Backend", status: "done", currentTask: null },
      { name: "Frontend", status: "working", currentTask: "Pipeline board UI" }, { name: "DevOps", status: "working", currentTask: "CI/CD + Docker" },
      { name: "QA", status: "idle", currentTask: null }, { name: "Security", status: "working", currentTask: "Threat model" },
      { name: "Docs", status: "idle", currentTask: null }, { name: "Reviewer", status: "idle", currentTask: null },
    ],
  },
];
