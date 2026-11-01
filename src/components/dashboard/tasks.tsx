"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckSquare, GripVertical, Search, Square } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Task, TaskStatus } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { STATUS_META, STATUS_ORDER, agentHex, taskMeta } from "@/lib/sim";
import { useDash } from "./store";
import { AgentTag, Bar, NeedProject, PageHead, StatusPill, field, hud } from "./kit";

const COLS: TaskStatus[] = ["todo", "running", "review", "done", "failed"];

export function TasksView() {
  const { project, moveTask } = useDash();
  const [q, setQ] = useState("");
  const [agent, setAgent] = useState("all");
  const [mod, setMod] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const modules = useMemo(() => [...new Set(project?.tasks.map((t) => t.module) ?? [])], [project]);
  if (!project) return <NeedProject />;
  const list = project.tasks.filter((t) =>
    (agent === "all" || t.agent === agent) && (mod === "all" || t.module === mod) && (!q || `${t.title} ${t.module} ${t.agent}`.toLowerCase().includes(q.toLowerCase())),
  );
  const open = project.tasks.find((t) => t.id === openId) ?? null;
  const shift = (t: Task, dir: -1 | 1) => {
    const i = COLS.indexOf(t.status === "failed" ? "running" : t.status);
    const nx = COLS[Math.max(0, Math.min(3, i + dir))];
    if (nx !== t.status) moveTask(t.id, nx);
  };
  return (
    <>
      <PageHead kicker={`Board / ${project.name}`} title="Tasks">
        <span className="font-mono text-xs text-muted-foreground">{list.length}/{project.tasks.length} shown. Drag cards or use the arrows.</span>
      </PageHead>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-0 flex-1 basis-48">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className={cn(field, "pl-8")} />
        </label>
        <select value={agent} onChange={(e) => setAgent(e.target.value)} aria-label="Filter by agent" className={cn(field, "w-auto")}>
          <option value="all" className="bg-[#0a0d1c]">All agents</option>
          {AGENTS.map((a) => <option key={a} className="bg-[#0a0d1c]">{a}</option>)}
        </select>
        <select value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Filter by module" className={cn(field, "w-auto")}>
          <option value="all" className="bg-[#0a0d1c]">All modules</option>
          {modules.map((m) => <option key={m} className="bg-[#0a0d1c]">{m}</option>)}
        </select>
        {(q || agent !== "all" || mod !== "all") && <button onClick={() => { setQ(""); setAgent("all"); setMod("all"); }} className="gh-btn gh-btn-ghost !h-8 text-xs">Clear</button>}
      </div>

      <div className="-mx-3 overflow-x-auto px-3 pb-3 sm:mx-0 sm:px-0">
        <div className="grid min-w-[1060px] grid-cols-5 gap-3">
          {COLS.map((col) => {
            const items = list.filter((t) => t.status === col);
            const m = STATUS_META[col];
            return (
              <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setOver(col); }}
                onDragLeave={() => setOver((o) => (o === col ? null : o))}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain") || dragId; if (id) moveTask(id, col); setOver(null); setDragId(null); }}
                className={cn("gh-glass flex min-h-72 flex-col rounded-md transition-colors", over === col && "bg-[color-mix(in_srgb,var(--acc)_10%,transparent)] outline outline-1 outline-[var(--acc)]")}
                style={{ borderTop: `2px solid ${m.color}` }}
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className={hud} style={{ color: m.color }}>{m.label}</span>
                  <span className="ml-auto rounded-sm bg-white/10 px-1.5 font-mono text-[10px]">{items.length}</span>
                </div>
                <ul className="flex flex-1 flex-col gap-2 p-2 pt-0">
                  {items.map((t) => (
                    <li key={t.id}>
                      <article
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); e.dataTransfer.effectAllowed = "move"; setDragId(t.id); }}
                        onDragEnd={() => { setDragId(null); setOver(null); }}
                        className={cn("group rounded-md border border-[var(--gh-line)] bg-[#0a0d1c]/80 p-2.5 text-sm transition hover:border-[var(--acc)]/50", dragId === t.id && "opacity-40")}
                        style={{ borderLeft: `3px solid ${agentHex(t.agent)}` }}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="mt-0.5 size-3.5 shrink-0 cursor-grab text-muted-foreground/50" />
                          <button onClick={() => setOpenId(t.id)} className="min-w-0 flex-1 text-left font-medium leading-snug hover:text-[var(--acc)]">{t.title}</button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5"><AgentTag name={t.agent} /><span className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{t.module}</span></div>
                        {t.status !== "todo" && <div className="mt-2 flex items-center gap-2"><Bar value={t.progress} color={m.color} /><span className="font-mono text-[10px] tabular-nums">{t.progress}%</span></div>}
                        <div className="mt-2 flex items-center justify-between">
                          <button onClick={() => shift(t, -1)} aria-label="Move left" className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"><ArrowLeft className="size-3.5" /></button>
                          <span className="font-mono text-[10px] text-muted-foreground">{taskMeta(t).priority}</span>
                          <button onClick={() => shift(t, 1)} aria-label="Move right" className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"><ArrowRight className="size-3.5" /></button>
                        </div>
                      </article>
                    </li>
                  ))}
                  {!items.length && (
                    <li className="flex flex-1 items-center justify-center rounded-md border border-dashed border-[var(--gh-line)] p-4 text-center text-xs text-muted-foreground">
                      {q || agent !== "all" || mod !== "all" ? "No matches in this lane" : "Drop a card here"}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <TaskDialog task={open} onClose={() => setOpenId(null)} />
    </>
  );
}

function TaskDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { moveTask } = useDash();
  const meta = task ? taskMeta(task) : null;
  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {task && meta && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6 font-display text-lg">{task.title}</DialogTitle>
              <DialogDescription>{meta.description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2"><StatusPill status={task.status} /><AgentTag name={task.agent} /><span className="font-mono text-[10px] text-muted-foreground">{task.module} / {meta.priority} / ETA {meta.eta}</span></div>
            <div className="flex items-center gap-3"><Bar value={task.progress} color={STATUS_META[task.status].color} /><span className="font-mono text-xs">{task.progress}%</span></div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-[var(--gh-line)] p-2.5"><div className={hud}>Assignee</div><p className="mt-1 font-medium">{meta.assignee.name}</p><p className="text-muted-foreground">{meta.assignee.role}</p></div>
              <div className="rounded-md border border-[var(--gh-line)] p-2.5"><div className={hud}>Lead</div><p className="mt-1 font-medium">{task.agent} agent</p><p className="text-muted-foreground">{meta.subtasks.filter((s) => s.done).length}/{meta.subtasks.length} subtasks</p></div>
            </div>
            <div>
              <div className={cn(hud, "mb-1.5")}>Subtasks</div>
              <ul className="grid gap-1">
                {meta.subtasks.map((s) => (
                  <li key={s.title} className={cn("flex items-center gap-2 text-sm", s.done && "text-muted-foreground line-through")}>
                    {s.done ? <CheckSquare className="size-4 text-emerald-400" /> : <Square className="size-4 text-muted-foreground" />}{s.title}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className={cn(hud, "mb-1.5")}>Activity</div>
              <div className="rounded-md bg-black/30 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {meta.log.map((l, i) => <div key={i}><span className="text-[var(--acc)]">&gt;</span> {l}</div>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.filter((s) => s !== task.status).map((s) => (
                <button key={s} onClick={() => { moveTask(task.id, s); }} className="gh-btn gh-btn-ghost !h-8 text-xs" style={{ color: STATUS_META[s].color }}>Move to {STATUS_META[s].label}</button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
