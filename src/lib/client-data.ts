import type { ProjectDetail, ProjectInput } from "./contracts";
import { demoSeed, enrich, newProjectDetail } from "./sim";

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
const LS_PROJECTS = "ghost-ai:v2:projects";
const LS_BASE = "ghost-ai:v2:api-base";

export const isDemoForced = () => DEMO;
export type Source = "live" | "demo";

let apiBase = "";
export const getApiBase = () => apiBase;
export function setApiBase(v: string) {
  apiBase = v.trim().replace(/\/+$/, "");
  try {
    window.localStorage.setItem(LS_BASE, apiBase);
  } catch {
    /* ignore */
  }
}
export function loadApiBase(): string {
  try {
    apiBase = window.localStorage.getItem(LS_BASE) ?? "";
  } catch {
    /* ignore */
  }
  return apiBase;
}

async function getJson<T>(path: string, init?: RequestInit, timeout = 4000): Promise<T> {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(apiBase + path, { ...init, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(to);
  }
}

/* ---------- local persistence ---------- */
export function loadLocal(): ProjectDetail[] | null {
  try {
    const raw = window.localStorage.getItem(LS_PROJECTS);
    if (raw) {
      const v = JSON.parse(raw) as ProjectDetail[];
      if (Array.isArray(v)) return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}
export function saveLocal(list: ProjectDetail[]) {
  try {
    window.localStorage.setItem(LS_PROJECTS, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/* ---------- live API (each throws when unavailable) ---------- */
export async function probeLive(): Promise<boolean> {
  if (DEMO) return false;
  try {
    await getJson("/api/health", undefined, 2500);
    return true;
  } catch {
    return false;
  }
}

export async function loadLive(): Promise<ProjectDetail[]> {
  const list = await getJson<ProjectDetail[]>("/api/projects");
  const out = await Promise.all(
    list.map((p) => getJson<ProjectDetail>(`/api/projects/${encodeURIComponent(p.id)}`).catch(() => ({ ...p, tasks: [], gitlog: [], agents: [] }) as ProjectDetail)),
  );
  return out.map((p) => enrich({ ...p, tasks: p.tasks ?? [], gitlog: p.gitlog ?? [], agents: p.agents ?? [] }));
}

export async function loadLiveOne(id: string): Promise<ProjectDetail> {
  const p = await getJson<ProjectDetail>(`/api/projects/${encodeURIComponent(id)}`);
  return { ...p, tasks: p.tasks ?? [], gitlog: p.gitlog ?? [], agents: p.agents ?? [] };
}

export async function runRemote(id: string): Promise<ProjectDetail> {
  await getJson(`/api/projects/${encodeURIComponent(id)}/run`, { method: "POST" });
  return loadLiveOne(id);
}

export async function createRemote(input: ProjectInput): Promise<ProjectDetail> {
  const p = await getJson<{ id: string }>("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return loadLiveOne(p.id);
}

/** Best-effort, never throws. */
export function mutateRemote(id: string, method: "PATCH" | "DELETE", body?: unknown) {
  void fetch(`${apiBase}/api/projects/${encodeURIComponent(id)}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => undefined);
}

export async function fetchStack(): Promise<string[] | null> {
  try {
    const d = await getJson<unknown>("/api/stack", undefined, 2500);
    const arr = Array.isArray(d) ? d : (d as { stack?: unknown; items?: unknown })?.stack ?? (d as { items?: unknown })?.items;
    if (!Array.isArray(arr)) return null;
    const names = arr.map((x) => (typeof x === "string" ? x : (x as { name?: string })?.name)).filter((x): x is string => !!x);
    return names.length ? names : null;
  } catch {
    return null;
  }
}

/* ---------- demo ---------- */
export function loadDemo(): ProjectDetail[] {
  return loadLocal() ?? demoSeed();
}

export function createDemo(input: ProjectInput): ProjectDetail {
  return newProjectDetail(`demo-${Date.now().toString(36)}`, input);
}
