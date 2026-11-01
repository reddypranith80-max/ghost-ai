import { test, expect } from "./fixtures";

const body = { name: "API Test Project", brief: "Created by the API e2e test suite.", stack: ["Next.js", "Clerk", "Postgres"] };

test.describe.configure({ mode: "serial" });

test("health, stats, stack, agents, openapi", async ({ request }) => {
  const h = await request.get("/api/health");
  expect(h.status()).toBe(200);
  expect(await h.json()).toMatchObject({ ok: true, db: "up", authEnabled: false });

  const s = await (await request.get("/api/stats")).json();
  expect(s).toHaveProperty("projects");
  expect(s).toHaveProperty("tasksByStatus");

  const stack = await (await request.get("/api/stack")).json();
  expect(Object.keys(stack).length).toBeGreaterThan(2);

  const agents = await (await request.get("/api/agents")).json();
  expect(agents).toHaveLength(8);
  const one = await request.get("/api/agents/ARCHITECT");
  expect(one.status()).toBe(200);
  expect((await one.json()).name).toBe("Architect");
  expect((await request.get("/api/agents/nobody")).status()).toBe(404);

  const spec = await (await request.get("/api/openapi")).json();
  expect(spec.openapi).toMatch(/^3\./);
  expect(Object.keys(spec.paths).length).toBeGreaterThanOrEqual(10);
});

test("projects CRUD, tasks, run, gitlog, export", async ({ request }) => {
  const created = await request.post("/api/projects", { data: body });
  expect(created.status()).toBe(201);
  const p = await created.json();
  expect(p.tasks.length).toBeGreaterThan(5);
  expect(p.agents).toHaveLength(8);

  const list = await (await request.get("/api/projects")).json();
  expect(list.some((x: { id: string }) => x.id === p.id)).toBe(true);
  const got = await request.get(`/api/projects/${p.id}`);
  expect(got.status()).toBe(200);
  expect((await got.json()).name).toBe(body.name);

  const tasks = await (await request.get(`/api/projects/${p.id}/tasks`)).json();
  expect(tasks.length).toBe(p.tasks.length);
  expect((await request.get(`/api/projects/${p.id}/tasks?status=todo`)).status()).toBe(200);
  expect((await request.get(`/api/projects/${p.id}/tasks?status=bogus`)).status()).toBe(400);
  const t = tasks[0];
  const patched = await request.patch(`/api/projects/${p.id}/tasks/${t.id}`, { data: { status: "running", progress: 40 } });
  expect(patched.status()).toBe(200);
  expect((await patched.json()).tasks.find((x: { id: string }) => x.id === t.id)).toMatchObject({ status: "running", progress: 40 });
  expect((await request.patch(`/api/projects/${p.id}/tasks/${t.id}`, { data: { status: "done", progress: 10 } })).status()).toBe(400);
  expect((await request.patch(`/api/projects/${p.id}/tasks/${t.id}`, { data: {} })).status()).toBe(400);
  expect((await request.patch(`/api/projects/${p.id}/tasks/nope`, { data: { progress: 5 } })).status()).toBe(404);

  const run = await request.post(`/api/projects/${p.id}/run`);
  expect(run.status()).toBe(200);
  const gl = await (await request.get(`/api/projects/${p.id}/gitlog`)).json();
  expect(Array.isArray(gl)).toBe(true);
  expect((await request.get(`/api/projects/${p.id}/gitlog?limit=0`)).status()).toBe(400);
  expect((await request.get(`/api/projects/${p.id}/gitlog?agent=Nope`)).status()).toBe(400);
  expect((await request.get(`/api/projects/${p.id}/gitlog?limit=1`)).status()).toBe(200);

  const md = await request.get(`/api/projects/${p.id}/export?format=md`);
  expect(md.status()).toBe(200);
  expect(md.headers()["content-type"]).toContain("markdown");
  expect(await md.text()).toContain(`# ${body.name}`);
  const js = await request.get(`/api/projects/${p.id}/export`);
  expect((await js.json()).id).toBe(p.id);
  expect((await request.get(`/api/projects/${p.id}/export?format=pdf`)).status()).toBe(400);

  const del = await request.delete(`/api/projects/${p.id}`);
  expect(del.status()).toBe(200);
  expect((await request.get(`/api/projects/${p.id}`)).status()).toBe(404);
});

test("validation and 404 cases", async ({ request }) => {
  expect((await request.post("/api/projects", { data: { name: "x" } })).status()).toBe(400);
  expect((await request.post("/api/projects", { data: { ...body, stack: [] } })).status()).toBe(400);
  const bad = await request.post("/api/projects", { headers: { "content-type": "application/json" }, data: "{not json" });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).error.code).toBeTruthy();
  expect((await request.get("/api/projects/does-not-exist")).status()).toBe(404);
  expect((await request.get("/api/projects/does-not-exist/tasks")).status()).toBe(404);
  expect((await request.get("/api/projects/does-not-exist/gitlog")).status()).toBe(404);
  expect((await request.get("/api/projects/does-not-exist/export")).status()).toBe(404);
  expect((await request.post("/api/projects/does-not-exist/run")).status()).toBe(404);
  expect((await request.delete("/api/projects/does-not-exist")).status()).toBe(404);
  const e = await (await request.get("/api/projects/does-not-exist")).json();
  expect(e.error.code).toBe("not_found");
  const opt = await request.fetch("/api/projects", { method: "OPTIONS" });
  expect(opt.status()).toBeLessThan(300);
});

test("pipeline completes then run returns 409", async ({ request }) => {
  const p = await (await request.post("/api/projects", { data: body })).json();
  let last = 200;
  for (let i = 0; i < 80 && last === 200; i++) last = (await request.post(`/api/projects/${p.id}/run`)).status();
  expect(last).toBe(409);
  const done = await (await request.get(`/api/projects/${p.id}`)).json();
  expect(done.tasks.every((t: { status: string }) => t.status === "done")).toBe(true);
  await request.delete(`/api/projects/${p.id}`);
});
