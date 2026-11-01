import { randomBytes, randomUUID } from "node:crypto";
import { and, asc, desc, eq, isNull, or } from "drizzle-orm";
import { db, ensureDb, schema } from "@/db";
import { AGENTS, type AgentName, type AgentState, type GitLog, type Project, type ProjectDetail, type ProjectInput, type Stats, type Task, type TaskStatus } from "./contracts";
import { MOCK_PROJECTS } from "./mock-data";
import { ApiError } from "./api-utils";

const { projects, tasks, gitlog } = schema;
let seeding: Promise<void> | null = null;

async function ready() {
  await ensureDb();
  seeding ??= (async () => {
    const existing = await db.select({ id: projects.id }).from(projects).limit(1);
    if (existing.length) return;
    for (const p of MOCK_PROJECTS) {
      await db.insert(projects).values({ id: p.id, name: p.name, brief: p.brief, stack: p.stack, status: p.status, createdAt: p.createdAt, ownerId: null });
      await db.insert(tasks).values(p.tasks.map((t, i) => ({ ...t, position: i })));
      await db.insert(gitlog).values(p.gitlog);
    }
  })().catch((e) => {
    seeding = null;
    throw e;
  });
  await seeding;
}

function deriveAgents(ts: Task[]): AgentState[] {
  return AGENTS.map((name) => {
    const mine = ts.filter((t) => t.agent === name);
    const active = mine.find((t) => t.status === "running" || t.status === "review");
    const status: AgentState["status"] = active ? "working" : mine.length && mine.every((t) => t.status === "done") ? "done" : "idle";
    return { name, status, currentTask: active?.title ?? null };
  });
}

const toProject = (r: typeof projects.$inferSelect): Project => ({ id: r.id, name: r.name, brief: r.brief, stack: r.stack, status: r.status, createdAt: r.createdAt });
const toTask = (r: typeof tasks.$inferSelect): Task => ({ id: r.id, projectId: r.projectId, title: r.title, module: r.module, agent: r.agent as AgentName, status: r.status as TaskStatus, progress: r.progress, subAgent: r.subAgent });
const toLog = (r: typeof gitlog.$inferSelect): GitLog => ({ id: r.id, projectId: r.projectId, hash: r.hash, message: r.message, agent: r.agent as AgentName, files: r.files, at: r.at });

async function detail(p: Project): Promise<ProjectDetail> {
  const ts = (await db.select().from(tasks).where(eq(tasks.projectId, p.id)).orderBy(asc(tasks.position))).map(toTask);
  const gl = (await db.select().from(gitlog).where(eq(gitlog.projectId, p.id)).orderBy(asc(gitlog.at))).map(toLog);
  return { ...p, tasks: ts, gitlog: gl, agents: deriveAgents(ts) };
}

type Uid = string | null;

/** Visible = owned by user, or demo (no owner). With no user, everything is visible. */
const canRead = (ownerId: string | null, uid: Uid) => uid === null || ownerId === null || ownerId === uid;
const canWrite = (ownerId: string | null, uid: Uid) => uid === null || ownerId === uid;

export async function listProjects(uid: Uid = null): Promise<ProjectDetail[]> {
  await ready();
  const rows = await db
    .select()
    .from(projects)
    .where(uid ? or(eq(projects.ownerId, uid), isNull(projects.ownerId)) : undefined)
    .orderBy(desc(projects.createdAt));
  return Promise.all(rows.map((r) => detail(toProject(r))));
}

export async function getProject(id: string, uid: Uid = null): Promise<ProjectDetail | null> {
  await ready();
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row && canRead(row.ownerId, uid) ? detail(toProject(row)) : null;
}

async function loadWritable(id: string, uid: Uid) {
  await ready();
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!row || !canRead(row.ownerId, uid)) throw new ApiError(404, "not_found", "Project not found");
  if (!canWrite(row.ownerId, uid)) throw new ApiError(403, "forbidden", "This project is read-only for your account");
  return row;
}

type Planned = { title: string; module: string; agent: AgentName; subAgent: string };

function plan(input: ProjectInput): Planned[] {
  const s = input.stack.map((x) => x.toLowerCase());
  const has = (...k: string[]) => s.some((x) => k.some((y) => x.includes(y)));
  const front = input.stack.find((x) => /next|react|vue|svelte|angular|solid|remix|nuxt/i.test(x)) ?? "UI";
  const store = input.stack.find((x) => /drizzle|prisma|postgres|sqlite|mongo|supabase|mysql|turso|libsql/i.test(x)) ?? "data layer";
  const out: Planned[] = [
    { title: `System design + ADRs for ${input.name}`, module: "Core", agent: "Architect", subAgent: "arch-stack" },
    { title: `Schema design for ${store}`, module: "Data", agent: "Architect", subAgent: "arch-schema" },
    { title: "API contract (OpenAPI) for all endpoints", module: "API", agent: "Architect", subAgent: "arch-contract" },
    { title: `Migrations and seed data on ${store}`, module: "Data", agent: "Backend", subAgent: "be-db" },
    { title: "REST endpoints with validation", module: "API", agent: "Backend", subAgent: "be-api" },
  ];
  if (has("clerk", "auth", "nextauth", "supabase")) out.push({ title: "Auth, sessions and roles", module: "Auth", agent: "Backend", subAgent: "be-auth" });
  if (has("stripe", "payment")) out.push({ title: "Checkout and webhook handlers", module: "Payments", agent: "Backend", subAgent: "be-api" });
  out.push(
    { title: `${front} layouts and design system`, module: "UI", agent: "Frontend", subAgent: "fe-ui" },
    { title: "Core feature screens and forms", module: "UI", agent: "Frontend", subAgent: "fe-ui" },
    { title: "Transitions and micro-interactions", module: "UI", agent: "Frontend", subAgent: "fe-motion" },
    { title: "Accessibility and responsive pass", module: "UI", agent: "Frontend", subAgent: "fe-a11y" },
    { title: "CI pipeline and preview deploys", module: "Infra", agent: "DevOps", subAgent: "do-ci" },
  );
  if (has("docker")) out.push({ title: "Dockerfile and image build", module: "Infra", agent: "DevOps", subAgent: "do-box" });
  out.push(
    { title: "Health checks and logging", module: "Infra", agent: "DevOps", subAgent: "do-watch" },
    { title: "Unit tests for core logic", module: "Quality", agent: "QA", subAgent: "qa-unit" },
    { title: "End-to-end happy-path tests", module: "Quality", agent: "QA", subAgent: "qa-e2e" },
    { title: "Dependency audit", module: "Security", agent: "Security", subAgent: "sec-dep" },
    { title: has("stripe") ? "Payment-flow threat model" : "Authorization review", module: "Security", agent: "Security", subAgent: "sec-authz" },
    { title: "README and runbook", module: "Docs", agent: "Docs", subAgent: "doc-eli5" },
    { title: "API reference", module: "Docs", agent: "Docs", subAgent: "doc-api" },
    { title: "Pull request review sweep", module: "Core", agent: "Reviewer", subAgent: "rev-pr" },
    { title: "Final Go / No-Go release checklist", module: "Core", agent: "Reviewer", subAgent: "rev-ship" },
  );
  return out;
}

const hash7 = () => randomBytes(4).toString("hex").slice(0, 7);

export async function createProject(input: ProjectInput, uid: Uid = null): Promise<ProjectDetail> {
  await ready();
  const id = randomUUID();
  const now = new Date().toISOString();
  const items = plan(input);
  await db.insert(projects).values({ id, name: input.name, brief: input.brief, stack: input.stack, status: "planning", createdAt: now, ownerId: uid });
  await db.insert(tasks).values(
    items.map((t, i) => ({ id: randomUUID(), projectId: id, ...t, status: i === 0 ? "running" : "todo", progress: i === 0 ? 10 : 0, position: i })),
  );
  await db.insert(gitlog).values({
    id: randomUUID(),
    projectId: id,
    hash: hash7(),
    message: `chore: init ${input.name} (${input.stack.slice(0, 4).join(", ")})`,
    agent: "Architect",
    files: 2 + Math.min(input.stack.length, 6),
    at: now,
  });
  return (await getProject(id, uid))!;
}

export async function deleteProject(id: string, uid: Uid): Promise<void> {
  await loadWritable(id, uid);
  await db.delete(gitlog).where(eq(gitlog.projectId, id));
  await db.delete(tasks).where(eq(tasks.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

const PREFIX: Record<AgentName, string[]> = {
  Architect: ["docs(adr)", "feat(design)"],
  Backend: ["feat(api)", "feat(db)"],
  Frontend: ["feat(ui)", "style(ui)"],
  DevOps: ["ci", "build"],
  QA: ["test", "test(e2e)"],
  Security: ["fix(security)", "chore(deps)"],
  Docs: ["docs"],
  Reviewer: ["chore(review)", "refactor"],
};
const lower = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

async function commit(projectId: string, t: Task, verb: string) {
  const pre = PREFIX[t.agent];
  await db.insert(gitlog).values({
    id: randomUUID(),
    projectId,
    hash: hash7(),
    agent: t.agent,
    at: new Date().toISOString(),
    message: `${pre[Math.floor(Math.random() * pre.length)]}: ${verb} ${lower(t.title)}`.slice(0, 120),
    files: 1 + Math.floor(Math.random() * 9),
  });
}

async function setTask(id: string, status: TaskStatus, progress: number) {
  await db.update(tasks).set({ status, progress }).where(eq(tasks.id, id));
}

async function syncStatus(projectId: string) {
  const ts = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  const status = ts.length && ts.every((t) => t.status === "done") ? "shipped" : ts.some((t) => t.status !== "todo") ? "building" : "planning";
  await db.update(projects).set({ status }).where(eq(projects.id, projectId));
}

/** Advance the simulated pipeline one step. Throws 409 when nothing is left to do. */
export async function advancePipeline(id: string, uid: Uid): Promise<ProjectDetail> {
  await loadWritable(id, uid);
  const ts = (await db.select().from(tasks).where(eq(tasks.projectId, id)).orderBy(asc(tasks.position))).map(toTask);
  const review = ts.find((t) => t.status === "review");
  const running = ts.find((t) => t.status === "running");
  const next = ts.find((t) => t.status === "todo");
  if (!review && !running && !next) throw new ApiError(409, "pipeline_complete", "All tasks are already done");
  if (review) {
    await setTask(review.id, "done", 100);
    await commit(id, review, "complete");
  }
  if (running) {
    await setTask(running.id, "review", 90);
    await commit(id, running, "implement");
  }
  if (next) await setTask(next.id, "running", 25);
  await syncStatus(id);
  return (await getProject(id, uid))!;
}

export async function updateTask(projectId: string, taskId: string, patch: { status?: TaskStatus; progress?: number }, uid: Uid): Promise<ProjectDetail> {
  await loadWritable(projectId, uid);
  const [row] = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId))).limit(1);
  if (!row) throw new ApiError(404, "not_found", "Task not found");
  const status = patch.status ?? (row.status as TaskStatus);
  let progress = patch.progress ?? row.progress;
  if (patch.progress === undefined && patch.status) {
    progress = status === "done" ? 100 : status === "todo" ? 0 : status === "review" ? Math.max(row.progress, 90) : row.progress;
  }
  if (status === "done") progress = 100;
  await setTask(taskId, status, progress);
  if (status === "done" && row.status !== "done") await commit(projectId, toTask(row), "complete");
  await syncStatus(projectId);
  return (await getProject(projectId, uid))!;
}

export async function projectStats(uid: Uid): Promise<Stats> {
  const list = await listProjects(uid);
  const byStatus: Record<TaskStatus, number> = { todo: 0, running: 0, review: 0, done: 0, failed: 0 };
  let total = 0;
  let commits = 0;
  let working = 0;
  for (const p of list) {
    for (const t of p.tasks) {
      byStatus[t.status]++;
      total++;
    }
    commits += p.gitlog.length;
    working += p.agents.filter((a) => a.status === "working").length;
  }
  return { projects: list.length, tasks: total, tasksByStatus: byStatus, commits, agentsWorking: working, completionPct: total ? Math.round((byStatus.done / total) * 100) : 0 };
}
