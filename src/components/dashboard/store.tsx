"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AgentName, ProjectDetail, ProjectInput, Task, TaskStatus } from "@/lib/contracts";
import {
  createDemo, createRemote, getApiBase, isDemoForced, loadApiBase, loadDemo, loadLive, loadLiveOne, mutateRemote, probeLive,
  runRemote, saveLocal, setApiBase as persistApiBase, type Source,
} from "@/lib/client-data";
import { advance, demoSeed, makeCommit, makeLogLine, recomputeAgents, seedNotes, type LogLine, type Note } from "@/lib/sim";

export type Toast = { id: number; title: string; body?: string; kind: "ok" | "info" | "warn"; files?: string[] };
export const ACCENTS = [
  { id: "cyan", label: "Cyan", color: "#22e5ff" },
  { id: "violet", label: "Violet", color: "#a06bff" },
  { id: "emerald", label: "Emerald", color: "#34d399" },
  { id: "amber", label: "Amber", color: "#fbbf24" },
  { id: "rose", label: "Rose", color: "#fb7185" },
] as const;

type Ctx = {
  source: Source | "connecting";
  projects: ProjectDetail[];
  project: ProjectDetail | null;
  selectProject: (id: string) => void;
  loading: boolean;
  tick: number;
  feed: LogLine[];
  notes: Note[];
  markAllRead: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id" | "kind"> & { kind?: Toast["kind"] }) => void;
  dismissToast: (id: number) => void;
  running: boolean;
  runNext: () => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => void;
  assignTask: (a: { agent: AgentName; title: string; module: string; notes?: string }) => void;
  createProject: (input: ProjectInput) => Promise<ProjectDetail>;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  resetDemo: () => void;
  apiBase: string;
  setApiBase: (v: string) => void;
  accent: string;
  setAccent: (c: string) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  newOpen: boolean;
  setNewOpen: (v: boolean) => void;
  logsAgent: AgentName | null;
  setLogsAgent: (a: AgentName | null) => void;
  addNote: (text: string, kind?: Note["kind"]) => void;
};

const C = createContext<Ctx | null>(null);
export function useDash(): Ctx {
  const c = useContext(C);
  if (!c) throw new Error("useDash outside provider");
  return c;
}

const LS_SEL = "ghost-ai:v2:selected";
const LS_ACC = "ghost-ai:v2:accent";
let toastSeq = 0;

export function DashProvider({ children }: { children: React.ReactNode }) {
  const [source, setSource] = useState<Source | "connecting">("connecting");
  const [projects, setProjects] = useState<ProjectDetail[]>(() => demoSeed());
  const [selectedId, setSelectedId] = useState<string | null>("demo-1");
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [feed, setFeed] = useState<LogLine[]>([]);
  const [notes, setNotes] = useState<Note[]>(() => seedNotes());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [running, setRunning] = useState(false);
  const [apiBase, setApiBaseState] = useState("");
  const [accent, setAccentState] = useState<string>(ACCENTS[0].color);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [logsAgent, setLogsAgent] = useState<AgentName | null>(null);

  const sourceRef = useRef(source);
  const projectsRef = useRef(projects);
  const selRef = useRef(selectedId);
  const dirty = useRef(new Set<string>());
  const ready = useRef(false);
  useEffect(() => { sourceRef.current = source; }, [source]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { selRef.current = selectedId; }, [selectedId]);

  const project = useMemo(() => projects.find((p) => p.id === selectedId) ?? projects[0] ?? null, [projects, selectedId]);

  /* ---- toasts / notes ---- */
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback<Ctx["toast"]>((t) => {
    const id = ++toastSeq;
    setToasts((l) => [...l.slice(-3), { kind: "ok", ...t, id }]);
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), t.files ? 9000 : 4500);
  }, []);
  const addNote = useCallback((text: string, kind: Note["kind"] = "info") => {
    setNotes((n) => [{ id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`, text, kind, at: Date.now(), read: false }, ...n].slice(0, 40));
  }, []);
  const markAllRead = useCallback(() => setNotes((n) => n.map((x) => ({ ...x, read: true }))), []);

  const patch = useCallback((id: string, fn: (p: ProjectDetail) => ProjectDetail) => {
    setProjects((l) => l.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  /* ---- boot ---- */
  const goLive = useCallback(async () => {
    const list = await loadLive();
    dirty.current.clear();
    setProjects(list);
    setSource("live");
    setSelectedId((s) => (s && list.some((p) => p.id === s) ? s : list[0]?.id ?? null));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setApiBaseState(loadApiBase());
      try {
        const a = window.localStorage.getItem(LS_ACC);
        if (a) setAccentState(a);
      } catch { /* ignore */ }
      let sel: string | null = null;
      try { sel = window.localStorage.getItem(LS_SEL); } catch { /* ignore */ }
      if (await probeLive()) {
        try {
          const list = await loadLive();
          if (!alive) return;
          if (list.length) {
            setProjects(list);
            setSource("live");
            setSelectedId(sel && list.some((p) => p.id === sel) ? sel : list[0].id);
            setLoading(false);
            ready.current = true;
            return;
          }
        } catch { /* fall back */ }
      }
      if (!alive) return;
      const local = loadDemo();
      setProjects(local);
      setSource("demo");
      setSelectedId(sel && local.some((p) => p.id === sel) ? sel : local[0]?.id ?? null);
      setLoading(false);
      ready.current = true;
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (ready.current && source === "demo") saveLocal(projects);
  }, [projects, source]);

  useEffect(() => {
    if (!selectedId) return;
    try { window.localStorage.setItem(LS_SEL, selectedId); } catch { /* ignore */ }
  }, [selectedId]);

  /* ---- periodic retry of live API while in demo ---- */
  useEffect(() => {
    if (isDemoForced() || source !== "demo") return;
    const iv = setInterval(async () => {
      if (await probeLive()) {
        try {
          await goLive();
          toast({ title: "Live API connected", body: "Switched from demo data to the backend.", kind: "ok" });
          addNote("Live API reachable - switched from demo mode", "ok");
        } catch { /* stay in demo */ }
      }
    }, 20000);
    return () => clearInterval(iv);
  }, [source, goLive, toast, addNote]);

  /* ---- simulation loop ---- */
  useEffect(() => {
    if (source === "connecting") return;
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      const id = selRef.current;
      const cur = projectsRef.current.find((p) => p.id === id);
      if (!cur) return;
      if (sourceRef.current === "demo" || dirty.current.has(cur.id)) {
        const r = advance(cur, "auto");
        if (r.events.some((e) => e.kind !== "progress")) {
          setProjects((l) => l.map((p) => (p.id === cur.id ? r.project : p)));
          for (const e of r.events.filter((x) => x.kind === "done")) addNote(`${e.agent}: ${e.text}`, "ok");
        } else setProjects((l) => l.map((p) => (p.id === cur.id ? r.project : p)));
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [source, addNote]);

  useEffect(() => {
    if (source === "connecting") return;
    const cur = projectsRef.current.find((p) => p.id === selRef.current);
    if (cur) {
      const names = cur.agents.map((a) => a.name);
      setFeed((f) => (f.length ? f : Array.from({ length: 10 }, (_, i) => ({ ...makeLogLine(names[i % names.length], cur.agents[i % names.length].currentTask, i), t: Date.now() - (10 - i) * 4000 }))));
    }
    const iv = setInterval(() => {
      const cur = projectsRef.current.find((p) => p.id === selRef.current);
      if (!cur) return;
      const working = cur.agents.filter((a) => a.status === "working");
      const pick = working.length ? working[Math.floor(Math.random() * working.length)] : null;
      const agent = pick?.name ?? cur.agents[Math.floor(Math.random() * cur.agents.length)]?.name ?? "Architect";
      setFeed((f) => [...f.slice(-119), makeLogLine(agent, pick?.currentTask ?? null)]);
    }, 1700);
    return () => clearInterval(iv);
  }, [source]);

  useEffect(() => {
    if (source !== "live") return;
    const iv = setInterval(async () => {
      const id = selRef.current;
      if (!id || dirty.current.has(id)) return;
      try {
        const fresh = await loadLiveOne(id);
        setProjects((l) => l.map((p) => (p.id === id ? { ...p, ...fresh } : p)));
      } catch { /* keep current */ }
    }, 6000);
    return () => clearInterval(iv);
  }, [source]);

  /* ---- actions ---- */
  const selectProject = useCallback((id: string) => setSelectedId(id), []);

  const pushEvents = useCallback((evs: { agent: AgentName; text: string; kind: string }[]) => {
    setFeed((f) => [...f, ...evs.map((e) => ({ ...makeLogLine(e.agent, null), level: (e.kind === "done" ? "ok" : "info") as LogLine["level"], text: e.text }))].slice(-120));
  }, []);

  const runNext = useCallback(async () => {
    const p = projectsRef.current.find((x) => x.id === selRef.current);
    if (!p || running) return;
    setRunning(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      if (sourceRef.current === "live" && !dirty.current.has(p.id)) {
        try {
          const np = await runRemote(p.id);
          patch(p.id, (o) => ({ ...o, ...np }));
          toast({ title: "Pipeline advanced", body: "Backend executed the next step." });
          addNote(`${p.name}: pipeline advanced via API`, "ok");
          return;
        } catch { /* fall back to client sim */ }
        dirty.current.add(p.id);
      }
      const r = advance(p, "step");
      patch(p.id, () => r.project);
      pushEvents(r.events);
      if (!r.events.length) {
        toast({ title: "Nothing left to run", body: "All tasks are done or blocked. Add a task from the Agents view.", kind: "info" });
      } else {
        const done = r.events.filter((e) => e.kind === "done").length;
        toast({ title: `Pipeline advanced - ${r.events.length} update${r.events.length > 1 ? "s" : ""}`, body: r.events.slice(0, 2).map((e) => e.text).join("; "), kind: "ok" });
        if (done) addNote(`${p.name}: ${done} task${done > 1 ? "s" : ""} merged, ${r.commits.length} new commit${r.commits.length > 1 ? "s" : ""}`, "ok");
      }
    } finally {
      setRunning(false);
    }
  }, [running, patch, pushEvents, toast, addNote]);

  const moveTask = useCallback((taskId: string, status: TaskStatus) => {
    const p = projectsRef.current.find((x) => x.tasks.some((t) => t.id === taskId));
    if (!p) return;
    const t = p.tasks.find((x) => x.id === taskId)!;
    if (t.status === status) return;
    dirty.current.add(p.id);
    patch(p.id, (o) => {
      const np = structuredClone(o);
      const nt = np.tasks.find((x) => x.id === taskId)!;
      nt.status = status;
      nt.progress = status === "done" ? 100 : status === "todo" ? 0 : status === "review" ? Math.max(85, nt.progress) : status === "failed" ? nt.progress : Math.min(Math.max(nt.progress, 10), 90);
      if (status === "done") np.gitlog.push(makeCommit(np, nt, new Date().toISOString()));
      recomputeAgents(np);
      return np;
    });
    toast({ title: `Moved to ${status}`, body: t.title, kind: "info" });
  }, [patch, toast]);

  const assignTask = useCallback<Ctx["assignTask"]>((a) => {
    const p = projectsRef.current.find((x) => x.id === selRef.current);
    if (!p) return;
    dirty.current.add(p.id);
    const task: Task = { id: `${p.id}-u${Date.now().toString(36)}`, projectId: p.id, title: a.title, module: a.module, agent: a.agent, status: "todo", progress: 0 };
    patch(p.id, (o) => {
      const np = { ...o, tasks: [...o.tasks, task] };
      recomputeAgents(np);
      return np;
    });
    addNote(`${a.agent} assigned: ${a.title}`, "info");
    toast({ title: `Assigned to ${a.agent}`, body: a.title });
  }, [patch, toast, addNote]);

  const createProject = useCallback(async (input: ProjectInput) => {
    let np: ProjectDetail;
    if (sourceRef.current === "live") {
      try { np = await createRemote(input); }
      catch { np = createDemo(input); dirty.current.add(np.id); }
    } else np = createDemo(input);
    setProjects((l) => [np, ...l]);
    setSelectedId(np.id);
    addNote(`Project "${np.name}" created - agents spinning up`, "ok");
    toast({ title: "Project created", body: `${np.name}: ${np.tasks.length} tasks planned across 8 agents.` });
    return np;
  }, [addNote, toast]);

  const renameProject = useCallback((id: string, name: string) => {
    patch(id, (o) => ({ ...o, name }));
    if (sourceRef.current === "live") mutateRemote(id, "PATCH", { name });
    toast({ title: "Project renamed", body: name, kind: "info" });
  }, [patch, toast]);

  const deleteProject = useCallback((id: string) => {
    const name = projectsRef.current.find((p) => p.id === id)?.name ?? "Project";
    setProjects((l) => l.filter((p) => p.id !== id));
    setSelectedId((s) => (s === id ? projectsRef.current.find((p) => p.id !== id)?.id ?? null : s));
    if (sourceRef.current === "live") mutateRemote(id, "DELETE");
    toast({ title: "Project deleted", body: name, kind: "warn" });
  }, [toast]);

  const resetDemo = useCallback(() => {
    const seed = demoSeed();
    setProjects(seed);
    setSelectedId(seed[0].id);
    toast({ title: "Demo data restored", body: `${seed.length} sample projects loaded.`, kind: "info" });
  }, [toast]);

  const setApiBase = useCallback((v: string) => {
    persistApiBase(v);
    setApiBaseState(getApiBase());
    toast({ title: "API base saved", body: getApiBase() || "same origin", kind: "info" });
  }, [toast]);

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    try { window.localStorage.setItem(LS_ACC, c); } catch { /* ignore */ }
  }, []);

  /* ---- global shortcuts ---- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const value: Ctx = {
    source, projects, project, selectProject, loading, tick, feed, notes, markAllRead, toasts, toast, dismissToast, running, runNext,
    moveTask, assignTask, createProject, renameProject, deleteProject, resetDemo, apiBase, setApiBase, accent, setAccent,
    paletteOpen, setPaletteOpen, newOpen, setNewOpen, logsAgent, setLogsAgent, addNote,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
