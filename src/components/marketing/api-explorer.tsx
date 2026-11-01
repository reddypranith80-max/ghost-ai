"use client";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Code } from "./copy-button";
import { Panel } from "./ui";

type Ep = { method: "GET" | "POST"; path: string; tryPath?: string; desc: string; body?: string; response: string };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const EPS: Ep[] = [
  { method: "GET", path: "/api/projects", desc: "List all projects.", response: `[{ "id": "p_1", "name": "Acme CRM", "status": "building", "stack": ["Next.js","Clerk"], "createdAt": "2026-10-01T09:00:00Z" }]` },
  { method: "POST", path: "/api/projects", desc: "Create a project. Body is validated with Zod (name 2-60, brief 10-2000, stack 1-20).", body: `{"name":"Acme CRM","brief":"A CRM for small agencies with pipelines","stack":["Next.js","Drizzle"]}`, response: `{ "id": "p_2", "name": "Acme CRM", "status": "planning", "createdAt": "2026-11-01T10:00:00Z" }` },
  { method: "GET", path: "/api/projects/:id", tryPath: "/api/projects/demo", desc: "Project detail with tasks, git log and agent states.", response: `{ "id": "p_1", "name": "Acme CRM", "tasks": [...], "gitlog": [...], "agents": [...] }` },
  { method: "GET", path: "/api/projects/:id/tasks", tryPath: "/api/projects/demo/tasks", desc: "Tasks for a project.", response: `[{ "id": "t_1", "title": "Create schema", "module": "Data", "agent": "Backend", "status": "running", "progress": 60 }]` },
  { method: "GET", path: "/api/projects/:id/gitlog", tryPath: "/api/projects/demo/gitlog", desc: "Commit stream written by agents.", response: `[{ "hash": "a1f3c9d", "message": "feat(api): projects routes", "agent": "Backend", "files": 4 }]` },
  { method: "GET", path: "/api/projects/:id/export?format=json|md", tryPath: "/api/projects/demo/export?format=json", desc: "Export a project as JSON or Markdown.", response: `{ "project": {...}, "tasks": [...], "gitlog": [...] }` },
  { method: "POST", path: "/api/projects/:id/run", desc: "Start or advance the agent run for a project.", body: `{}`, response: `{ "ok": true, "status": "building" }` },
  { method: "GET", path: "/api/agents", desc: "All eight agents with their live status.", response: `[{ "name": "Architect", "status": "done", "currentTask": null }]` },
  { method: "GET", path: "/api/agents/:name", tryPath: "/api/agents/Architect", desc: "One agent: codename, tools, sub-agents and state.", response: `{ "name": "Architect", "codename": "ATLAS", "tools": ["Mermaid","ADR","OpenAPI"] }` },
  { method: "GET", path: "/api/stats", desc: "Counts of projects, tasks, commits and agents.", response: `{ "projects": 3, "tasks": 24, "commits": 57, "agentsWorking": 2 }` },
  { method: "GET", path: "/api/stack", desc: "Supported stack options.", response: `{ "frontend": ["Next.js"], "database": ["libSQL"], "auth": ["Clerk"] }` },
  { method: "GET", path: "/api/openapi", desc: "OpenAPI 3 document describing this API.", response: `{ "openapi": "3.0.3", "info": { "title": "Ghost AI" }, "paths": {...} }` },
  { method: "GET", path: "/api/health", desc: "Liveness probe.", response: `{ "ok": true }` },
];

const slug = (e: Ep) => `${e.method}-${e.path}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Row({ e }: { e: Ep }) {
  const [out, setOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const target = e.tryPath ?? e.path;
  const curl = e.method === "GET" ? `curl "https://YOUR_HOST${target}"` : `curl -X POST "https://YOUR_HOST${e.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${e.body}'`;
  async function run() {
    setBusy(true); setOut(null);
    try {
      const r = await fetch(`${BASE}${target}`, { headers: { accept: "application/json" } });
      const t = await r.text();
      try { setOut(`HTTP ${r.status}\n${JSON.stringify(JSON.parse(t), null, 2)}`); }
      catch { setOut(`HTTP ${r.status}\nThe endpoint did not return JSON. This is likely the static demo (no API on GitHub Pages).`); }
    } catch {
      setOut("Could not reach the API. This is likely the static demo build, which ships without /api routes. Run the app locally to try it.");
    } finally { setBusy(false); }
  }
  return (
    <Panel className="scroll-mt-24">
      <div id={slug(e)} className="scroll-mt-24" />
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${e.method === "GET" ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{e.method}</span>
        <code className="break-all text-sm text-white">{e.path}</code>
      </div>
      <p className="mt-2 text-sm text-[var(--gh-text-dim)]">{e.desc}</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Code title="curl" code={curl} />
        <Code title="example response" code={e.response} />
      </div>
      {e.method === "GET" ? (
        <div className="mt-3">
          <button type="button" onClick={run} disabled={busy} className="inline-flex items-center gap-2 rounded border border-cyan-400/50 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-400/20 disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} Try it
          </button>
          {out && <pre className="mt-3 max-h-64 overflow-auto rounded border border-[var(--gh-line)] bg-black/50 p-3 text-xs text-slate-200 whitespace-pre-wrap">{out}</pre>}
        </div>
      ) : <p className="mt-3 text-xs text-[var(--gh-text-dim)]">Try it is available for GET endpoints only.</p>}
    </Panel>
  );
}

export function ApiExplorer() {
  return (
    <div className="space-y-4">
      <nav aria-label="Endpoints" className="mb-6 flex flex-wrap gap-2">
        {EPS.map((e) => <a key={slug(e)} href={`#${slug(e)}`} className="rounded border border-[var(--gh-line)] bg-white/5 px-2 py-1 font-mono text-xs text-white/80 hover:bg-white/10">{e.method} {e.path.split("?")[0]}</a>)}
      </nav>
      {EPS.map((e) => <Row key={slug(e)} e={e} />)}
    </div>
  );
}
