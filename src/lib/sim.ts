/** Client-side simulation + deterministic derivations for the dashboard. No network, no randomness at render time. */
import type { AgentName, AgentState, GitLog, Project, ProjectDetail, Task, TaskStatus } from "./contracts";
import { AGENTS } from "./contracts";
import { AGENT_CATALOG, getAgentSpec, type AgentSpec, type SubAgent } from "./agent-catalog";
import { MOCK_PROJECTS } from "./mock-data";

/* ---------- deterministic helpers ---------- */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hex7 = (s: string) => hashStr(s).toString(16).padStart(8, "0").slice(0, 7);

export const AGENT_HEX: Record<AgentSpec["color"], string> = {
  cyan: "#22e5ff", violet: "#a06bff", emerald: "#34d399", amber: "#fbbf24",
  rose: "#fb7185", sky: "#38bdf8", fuchsia: "#e879f9", lime: "#a3e635",
};
export const agentHex = (n: AgentName) => AGENT_HEX[getAgentSpec(n).color];

export const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To do", color: "#8b93b8" },
  running: { label: "Running", color: "#22e5ff" },
  review: { label: "Review", color: "#fbbf24" },
  done: { label: "Done", color: "#34d399" },
  failed: { label: "Failed", color: "#fb7185" },
};
export const STATUS_ORDER: TaskStatus[] = ["todo", "running", "review", "done", "failed"];

export function sparkline(seed: string, n = 16, trend = 0.5, base = 40): number[] {
  const r = rng(hashStr(seed));
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (r() - 0.5 + (trend - 0.5) * 0.9) * 14;
    v = Math.max(4, v);
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

/* ---------- task pool ---------- */
const POOL: Record<AgentName, { title: string; module: string }[]> = {
  Architect: [{ title: "System design + ADRs", module: "Core" }, { title: "Data model review", module: "Core" }, { title: "API contract v1", module: "API" }],
  Backend: [{ title: "Auth & RBAC", module: "Auth" }, { title: "Billing webhooks", module: "Billing" }, { title: "Reporting endpoints", module: "API" }],
  Frontend: [{ title: "Pipeline board UI", module: "CRM" }, { title: "Settings screens", module: "UI" }, { title: "Onboarding wizard", module: "UI" }],
  DevOps: [{ title: "CI/CD + Docker", module: "Infra" }, { title: "Preview deployments", module: "Infra" }, { title: "Uptime + alerts", module: "Infra" }],
  QA: [{ title: "E2E happy path", module: "CRM" }, { title: "Regression suite", module: "Core" }, { title: "Load test baseline", module: "Infra" }],
  Security: [{ title: "Threat model", module: "Auth" }, { title: "Dependency audit", module: "Core" }, { title: "Secret scanning", module: "Infra" }],
  Docs: [{ title: "README + quickstart", module: "Docs" }, { title: "API reference", module: "Docs" }, { title: "Changelog v0.1", module: "Docs" }],
  Reviewer: [{ title: "PR review sweep", module: "Core" }, { title: "Definition of done check", module: "Core" }, { title: "Go / No-Go report", module: "Core" }],
};

const SUBTASKS: Record<AgentName, string[]> = {
  Architect: ["Collect constraints", "Draft diagram", "Write ADR", "Peer review"],
  Backend: ["Define schema", "Implement handlers", "Validate input (Zod)", "Seed + migrate"],
  Frontend: ["Wire layout", "Build components", "Responsive pass", "Empty/loading states"],
  DevOps: ["Write workflow", "Containerise", "Add health check", "Dry-run deploy"],
  QA: ["Write scenarios", "Automate checks", "Run in CI", "Triage failures"],
  Security: ["Enumerate assets", "Scan dependencies", "Review authz paths", "Report findings"],
  Docs: ["Outline", "Write draft", "Add examples", "Proofread"],
  Reviewer: ["Read diff", "Run checklist", "Leave comments", "Approve / block"],
};

const COMMIT_PREFIX: Record<AgentName, string> = {
  Architect: "docs(arch)", Backend: "feat(api)", Frontend: "feat(ui)", DevOps: "ci", QA: "test", Security: "fix(sec)", Docs: "docs", Reviewer: "chore(review)",
};

const FILE_POOL: Record<AgentName, string[]> = {
  Architect: ["docs/adr/0001-stack.md", "docs/architecture.md", "docs/api/openapi.yaml", "docs/diagrams/system.mmd"],
  Backend: ["src/app/api/route.ts", "src/db/schema.ts", "src/lib/auth.ts", "src/lib/validators.ts", "drizzle/0001_init.sql", "src/lib/billing.ts"],
  Frontend: ["src/components/board.tsx", "src/app/page.tsx", "src/components/ui/card.tsx", "src/app/globals.css", "src/components/nav.tsx", "src/hooks/use-data.ts"],
  DevOps: [".github/workflows/ci.yml", "Dockerfile", "vercel.json", ".dockerignore", "scripts/health.sh"],
  QA: ["tests/e2e/happy-path.spec.ts", "tests/unit/validators.test.ts", "playwright.config.ts", "vitest.config.ts"],
  Security: ["SECURITY.md", "src/proxy.ts", "docs/threat-model.md", "src/lib/csp.ts"],
  Docs: ["README.md", "docs/quickstart.md", "docs/api.md", "CHANGELOG.md"],
  Reviewer: [".coderabbit.yaml", "docs/review-checklist.md", "CODEOWNERS"],
};

export type SubtaskView = { title: string; done: boolean };
export type TaskMeta = {
  description: string; subtasks: SubtaskView[]; priority: "P0" | "P1" | "P2";
  assignee: SubAgent; eta: string; log: string[];
};

export function taskMeta(t: Task): TaskMeta {
  const spec = getAgentSpec(t.agent);
  const h = hashStr(t.id + t.title);
  const sts = SUBTASKS[t.agent];
  const doneN = t.status === "done" ? sts.length : Math.min(sts.length - (t.status === "todo" ? 0 : 0), Math.floor((t.progress / 100) * sts.length));
  const assignee = spec.subAgents[h % spec.subAgents.length];
  const log = [
    `${assignee.name} picked up "${t.title}"`,
    `scope: ${t.module} module, ${sts.length} steps`,
    ...(t.progress > 0 ? [`${sts.slice(0, Math.max(1, doneN)).map((s) => s.toLowerCase()).join(", ")} - complete`] : []),
    ...(t.status === "review" ? ["handed to Reviewer / PR Patrol"] : []),
    ...(t.status === "done" ? ["merged to main, checks green"] : []),
    ...(t.status === "failed" ? ["check failed - awaiting retry"] : []),
  ];
  return {
    description: `${spec.codename} (${t.agent}) delivers "${t.title}" for the ${t.module} module. Output: ${spec.produces.toLowerCase()}.`,
    subtasks: sts.map((title, i) => ({ title, done: i < doneN })),
    priority: (["P0", "P1", "P2"] as const)[h % 3],
    assignee,
    eta: t.status === "done" ? "shipped" : `~${Math.max(1, Math.round(((100 - t.progress) / 100) * (4 + (h % 5))))}h`,
    log,
  };
}

export function commitFiles(c: GitLog): { path: string; add: number; del: number }[] {
  const pool = FILE_POOL[c.agent];
  const r = rng(hashStr(c.hash));
  const n = Math.max(1, Math.min(c.files, 12));
  const out: { path: string; add: number; del: number }[] = [];
  for (let i = 0; i < n; i++) {
    const base = pool[(i + Math.floor(r() * pool.length)) % pool.length];
    const path = out.some((o) => o.path === base) ? base.replace(/(\.\w+)$/, `-${i}$1`) : base;
    out.push({ path, add: 4 + Math.floor(r() * 120), del: Math.floor(r() * 30) });
  }
  return out;
}

/* ---------- log stream ---------- */
export type LogLevel = "info" | "ok" | "warn" | "cmd";
export type LogLine = { id: string; t: number; agent: AgentName; sub: string; level: LogLevel; text: string };

const TEMPLATES: Record<AgentName, [LogLevel, string][]> = {
  Architect: [["cmd", "mermaid render docs/diagrams/system.mmd"], ["info", "evaluating {task}: 3 options compared"], ["ok", "ADR drafted for {task}"], ["info", "checking coupling between modules"]],
  Backend: [["cmd", "drizzle-kit generate"], ["info", "implementing handler for {task}"], ["ok", "zod schema validated, 14 cases pass"], ["warn", "N+1 query spotted, adding index"]],
  Frontend: [["cmd", "next build --turbopack"], ["info", "composing components for {task}"], ["ok", "lighthouse a11y 98"], ["info", "tuning motion curves"]],
  DevOps: [["cmd", "docker build -t app ."], ["info", "pipeline stage: lint, test, build"], ["ok", "image pushed (84 MB)"], ["warn", "cache miss on node_modules layer"]],
  QA: [["cmd", "playwright test --project=chromium"], ["info", "running scenarios for {task}"], ["ok", "42 passed, 0 failed"], ["warn", "flaky test quarantined"]],
  Security: [["cmd", "npm audit --omit=dev"], ["info", "tracing authz path for {task}"], ["ok", "0 high vulnerabilities"], ["warn", "missing rate limit on /api route"]],
  Docs: [["cmd", "md-lint docs/**"], ["info", "writing section for {task}"], ["ok", "README quickstart verified"], ["info", "generating endpoint tables"]],
  Reviewer: [["cmd", "coderabbit review --pr"], ["info", "reading diff for {task}"], ["ok", "checklist 11/12 satisfied"], ["warn", "1 required fix: error handling"]],
};

let lineSeq = 0;
export function makeLogLine(agent: AgentName, taskTitle: string | null, salt = 0): LogLine {
  const spec = getAgentSpec(agent);
  const r = rng(hashStr(agent + (taskTitle ?? "") + salt + lineSeq));
  const tpl = TEMPLATES[agent][Math.floor(r() * TEMPLATES[agent].length)];
  const sub = spec.subAgents[Math.floor(r() * spec.subAgents.length)];
  lineSeq++;
  return { id: `l${Date.now().toString(36)}${lineSeq}`, t: Date.now(), agent, sub: sub.name, level: tpl[0], text: tpl[1].replace("{task}", taskTitle ?? "backlog") };
}

export type SubView = { status: "working" | "idle" | "done" | "queued"; progress: number; current: string; log: string[] };
export function subAgentView(p: ProjectDetail, agent: AgentName, sub: SubAgent, tick: number): SubView {
  const lead = p.agents.find((a) => a.name === agent);
  const tasks = p.tasks.filter((t) => t.agent === agent);
  const prog = tasks.length ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) : 0;
  const h = hashStr(p.id + sub.id);
  const cur = lead?.currentTask ?? tasks.find((t) => t.status !== "done")?.title ?? "standby";
  let status: SubView["status"] = "idle";
  if (lead?.status === "working") status = (h + Math.floor(tick / 4)) % 3 === 0 ? "queued" : "working";
  else if (lead?.status === "done") status = "done";
  else if (tasks.some((t) => t.status === "todo")) status = "queued";
  const progress = status === "done" ? 100 : status === "idle" ? 0 : Math.max(2, Math.min(99, prog + ((h % 21) - 10)));
  const log = [`${sub.role.toLowerCase()}`, status === "working" ? `working on ${cur}` : status === "done" ? "all outputs delivered" : "waiting for upstream", `cycle #${(h % 90) + Math.floor(tick / 4)}`];
  return { status, progress, current: status === "idle" ? "standby" : cur, log };
}

/* ---------- pipeline simulation ---------- */
export function recomputeAgents(p: ProjectDetail): void {
  p.agents = AGENTS.map((name): AgentState => {
    const run = p.tasks.find((t) => t.agent === name && t.status === "running");
    const mine = p.tasks.filter((t) => t.agent === name);
    const status: AgentState["status"] = run ? "working" : mine.length && mine.every((t) => t.status === "done") ? "done" : "idle";
    return { name, status, currentTask: run ? run.title : null };
  });
  const done = p.tasks.length > 0 && p.tasks.every((t) => t.status === "done");
  if (done) p.status = "shipped";
  else if (p.tasks.some((t) => t.status !== "todo")) p.status = "building";
}

export function makeCommit(p: ProjectDetail, t: Task, at: string): GitLog {
  return {
    id: `g-${t.id}-${p.gitlog.length}`, projectId: p.id, hash: hex7(t.id + p.gitlog.length + t.title),
    message: `${COMMIT_PREFIX[t.agent]}: ${t.title.toLowerCase()}`, agent: t.agent, files: 2 + (hashStr(t.id) % 7), at,
  };
}

export type SimResult = { project: ProjectDetail; events: { agent: AgentName; text: string; kind: "start" | "review" | "done" | "progress" }[]; commits: GitLog[] };

/** mode "step" = user pressed Run next step (big visible move); "auto" = ambient tick. */
export function advance(src: ProjectDetail, mode: "step" | "auto"): SimResult {
  const p = structuredClone(src);
  const events: SimResult["events"] = [];
  const commits: GitLog[] = [];
  const r = Math.random;
  for (const t of p.tasks) {
    if (t.status === "running") {
      t.progress = Math.min(100, t.progress + (mode === "step" ? 22 + Math.floor(r() * 14) : 1 + Math.floor(r() * 3)));
      if (t.progress >= 100) {
        t.status = "review";
        t.progress = 92;
        events.push({ agent: t.agent, text: `"${t.title}" ready for review`, kind: "review" });
      } else if (mode === "step") events.push({ agent: t.agent, text: `"${t.title}" advanced to ${t.progress}%`, kind: "progress" });
    } else if (t.status === "review" && (mode === "step" || r() < 0.12)) {
      t.status = "done";
      t.progress = 100;
      const c = makeCommit(p, t, new Date().toISOString());
      p.gitlog.push(c);
      commits.push(c);
      events.push({ agent: t.agent, text: `"${t.title}" approved and merged (${c.hash})`, kind: "done" });
      if (mode === "auto") break;
    }
  }
  const runCount = p.tasks.filter((t) => t.status === "running").length;
  if (runCount < (mode === "step" ? 3 : 2) && (mode === "step" || r() < 0.2)) {
    const next = p.tasks.find((t) => t.status === "todo");
    if (next) {
      next.status = "running";
      next.progress = 8;
      events.push({ agent: next.agent, text: `started "${next.title}"`, kind: "start" });
    }
  }
  recomputeAgents(p);
  return { project: p, events, commits };
}

/* ---------- seed data ---------- */
const STAGES = ["done", "done", "done", "running", "running", "review", "todo", "todo", "todo", "todo", "failed"] as const;

function build(id: string, name: string, brief: string, stack: string[], status: Project["status"], createdAt: string, seed: number): ProjectDetail {
  const r = rng(seed);
  const tasks: Task[] = [];
  let n = 0;
  for (const agent of AGENTS) {
    POOL[agent].forEach((item, i) => {
      const st: TaskStatus = i === 0 ? (r() < 0.8 ? "done" : "review") : i === 1 ? STAGES[Math.floor(r() * 7)] : (["todo", "todo", "running"] as const)[Math.floor(r() * 3)];
      tasks.push({ id: `${id}-t${++n}`, projectId: id, title: item.title, module: item.module, agent, status: st, progress: st === "done" ? 100 : st === "todo" ? 0 : st === "review" ? 85 + Math.floor(r() * 10) : 15 + Math.floor(r() * 70) });
    });
  }
  const p: ProjectDetail = { id, name, brief, stack, status, createdAt, tasks, gitlog: [], agents: [] };
  backfillCommits(p);
  recomputeAgents(p);
  p.status = status;
  return p;
}

function backfillCommits(p: ProjectDetail) {
  const have = new Set(p.gitlog.map((g) => g.agent + g.message));
  const base = new Date(p.createdAt).getTime();
  let i = p.gitlog.length;
  for (const t of p.tasks.filter((x) => x.status === "done" || x.status === "review")) {
    const c = makeCommit(p, t, new Date(base + (++i) * 47 * 60000).toISOString());
    if (have.has(c.agent + c.message)) continue;
    p.gitlog.push(c);
  }
  p.gitlog.sort((a, b) => a.at.localeCompare(b.at));
}

/** Pad sparse projects (e.g. the single mock one) so no view is ever empty. */
export function enrich(src: ProjectDetail): ProjectDetail {
  if (src.tasks.length >= 10) return src;
  const p = structuredClone(src);
  let n = p.tasks.length;
  const have = new Set(p.tasks.map((t) => t.title));
  for (const agent of AGENTS) {
    for (const item of POOL[agent]) {
      if (have.has(item.title) || p.tasks.length >= 16) continue;
      p.tasks.push({ id: `${p.id}-x${++n}`, projectId: p.id, title: item.title, module: item.module, agent, status: "todo", progress: 0 });
    }
  }
  backfillCommits(p);
  recomputeAgents(p);
  return p;
}

export function newProjectDetail(id: string, input: { name: string; brief: string; stack: string[] }): ProjectDetail {
  const p = build(id, input.name, input.brief, input.stack, "planning", new Date().toISOString(), hashStr(id));
  for (const t of p.tasks) { t.status = "todo"; t.progress = 0; }
  p.gitlog = [];
  const first = p.tasks[0];
  if (first) { first.status = "running"; first.progress = 6; }
  recomputeAgents(p);
  p.status = "planning";
  return p;
}

export function demoSeed(): ProjectDetail[] {
  const base = MOCK_PROJECTS.map(enrich);
  return [
    ...base,
    build("demo-2", "Orbit Analytics", "Self-serve product analytics with funnels, cohorts and CSV export.", ["Next.js", "Postgres", "Drizzle", "Recharts"], "building", "2026-10-28T14:00:00Z", 77),
    build("demo-3", "Helios Storefront", "Headless storefront with cart, checkout and an admin catalogue.", ["Next.js", "Stripe", "Tailwind", "Clerk"], "shipped", "2026-10-22T08:30:00Z", 311),
  ];
}

export const STACK_SUGGESTIONS = [
  "Next.js", "React", "TypeScript", "Tailwind", "shadcn/ui", "Clerk", "Drizzle", "Postgres", "SQLite", "Stripe", "Vercel", "Docker",
  "tRPC", "Prisma", "Supabase", "Resend", "Playwright", "Vitest", "Redis", "GitHub Actions",
];

export type Note = { id: string; text: string; kind: "info" | "ok" | "warn"; at: number; read: boolean };
export const seedNotes = (): Note[] => [
  { id: "n1", text: "Reviewer approved ADR-001 stack selection", kind: "ok", at: 1761800000000, read: false },
  { id: "n2", text: "Security flagged a missing rate limit on /api", kind: "warn", at: 1761796400000, read: false },
  { id: "n3", text: "CodeRabbit finished reviewing PR #14", kind: "info", at: 1761792800000, read: true },
];

export { AGENT_CATALOG };

export function backlogLines(agent: AgentName, n: number, taskTitle: string | null = null): LogLine[] {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => ({ ...makeLogLine(agent, taskTitle, i), t: now - (n - i) * 5000 }));
}
