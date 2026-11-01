"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckSquare, GripVertical, Search, Square, X } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Task, TaskStatus } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { STATUS_META, STATUS_ORDER, taskMeta } from "@/lib/sim";
import { useDash } from "./store";
import { AgentTag, Bar, NeedProject, PageHead, STATUS_UI, StatusPill, codename, field, lbl, optionCls, selectField, tint } from "./kit";

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
  const filtered = !!q || agent !== "all" || mod !== "all";
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
      <PageHead title="Tasks" description={`${list.length}/${project.tasks.length} shown. Drag cards between lanes or use the arrows.`} />
      <div className="reveal reveal-1 mb-5 flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-0 flex-1 basis-56 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className={cn(field, "h-10 pl-10")} />
        </label>
        <select value={agent} onChange={(e) => setAgent(e.target.value)} aria-label="Filter by agent" className={cn(selectField, "!w-auto")}>
          <option value="all" className={optionCls}>All agents</option>
          {AGENTS.map((a) => <option key={a} className={optionCls}>{a}</option>)}
        </select>
        <select value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Filter by module" className={cn(selectField, "!w-auto")}>
          <option value="all" className={optionCls}>All modules</option>
          {modules.map((m) => <option key={m} className={optionCls}>{m}</option>)}
        </select>
        {filtered && <button onClick={() => { setQ(""); setAgent("all"); setMod("all"); }} className="btn btn-ghost btn-sm"><X className="size-3.5" /> Clear</button>}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
        <div className="grid min-w-[1040px] grid-cols-5 gap-3.5">
          {COLS.map((col, ci) => {
            const items = list.filter((t) => t.status === col);
            const m = STATUS_META[col];
            const c = STATUS_UI[col];
            return (
              <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setOver(col); }}
                onDragLeave={() => setOver((o) => (o === col ? null : o))}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain") || dragId; if (id) moveTask(id, col); setOver(null); setDragId(null); }}
                className={cn("gh-glass reveal flex min-h-80 flex-col !rounded-2xl !bg-white/[0.025] !shadow-none transition-[background,box-shadow] duration-200", `reveal-${ci + 2}`, over === col && "!bg-[var(--mint-tint)] !shadow-[0_0_0_1.5px_rgba(62,230,160,0.45)]")}
              >
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                  <span className="size-2 rounded-full" style={{ background: c }} />
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium tabular-nums" style={{ background: tint(c, 13), color: col === "todo" ? "var(--text-muted)" : c }}>{items.length}</span>
                </div>
                <ul className="flex flex-1 flex-col gap-2.5 p-2.5 pt-1.5">
                  {items.map((t) => (
                    <li key={t.id}>
                      <article
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); e.dataTransfer.effectAllowed = "move"; setDragId(t.id); }}
                        onDragEnd={() => { setDragId(null); setOver(null); }}
                        className={cn("group rounded-xl bg-[var(--surface-2)] p-3.5 text-sm shadow-[var(--inner-top),0_0_0_1px_var(--hairline),0_1px_2px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--inner-top),0_0_0_1px_var(--hairline-strong),var(--shadow-2)] active:cursor-grabbing", dragId === t.id && "scale-[0.97] opacity-40")}
                      >
                        <div className="flex items-start gap-2">
                          <button onClick={() => setOpenId(t.id)} className="min-w-0 flex-1 rounded-md text-left text-[14px] font-medium leading-snug transition-colors hover:text-[var(--mint)]">{t.title}</button>
                          <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <AgentTag name={t.agent} />
                          <span className="chip">{t.module}</span>
                        </div>
                        {t.status !== "todo" && (
                          <div className="mt-3 flex items-center gap-2.5"><Bar value={t.progress} color={c} /><span className="text-xs tabular-nums text-[var(--text-muted)]">{t.progress}%</span></div>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <button onClick={() => shift(t, -1)} aria-label="Move left" className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/[0.08] hover:text-foreground"><ArrowLeft className="size-3.5" /></button>
                          <span className="text-xs text-[var(--text-faint)]">{taskMeta(t).priority}</span>
                          <button onClick={() => shift(t, 1)} aria-label="Move right" className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/[0.08] hover:text-foreground"><ArrowRight className="size-3.5" /></button>
                        </div>
                      </article>
                    </li>
                  ))}
                  {!items.length && (
                    <li className="flex flex-1 items-center justify-center rounded-xl p-4 text-center text-[13px] text-[var(--text-faint)] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.05)]">
                      {filtered ? "No matches in this lane" : "Drop a card here"}
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
              <DialogTitle className="pr-8 font-display text-xl leading-snug">{task.title}</DialogTitle>
              <DialogDescription>{meta.description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2"><StatusPill status={task.status} /><AgentTag name={task.agent} /><span className="text-xs text-[var(--text-faint)]">{task.module} · {meta.priority} · ETA {meta.eta}</span></div>
            <div className="flex items-center gap-3"><Bar value={task.progress} color={STATUS_UI[task.status]} /><span className="text-xs font-semibold tabular-nums">{task.progress}%</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/[0.04] p-3.5"><div className={lbl}>Assignee</div><p className="mt-1.5 font-medium">{meta.assignee.name}</p><p className="text-xs text-[var(--text-faint)]">{meta.assignee.role}</p></div>
              <div className="rounded-xl bg-white/[0.04] p-3.5"><div className={lbl}>Lead</div><p className="mt-1.5 font-medium">{codename(task.agent)} agent</p><p className="text-xs text-[var(--text-faint)]">{meta.subtasks.filter((s) => s.done).length}/{meta.subtasks.length} subtasks</p></div>
            </div>
            <div>
              <div className={cn(lbl, "mb-2")}>Subtasks</div>
              <ul className="grid gap-1.5">
                {meta.subtasks.map((s) => (
                  <li key={s.title} className={cn("flex items-center gap-2.5 text-sm", s.done && "text-[var(--text-faint)] line-through")}>
                    {s.done ? <CheckSquare className="size-4 text-[var(--mint)]" /> : <Square className="size-4 text-[var(--text-faint)]" />}{s.title}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className={cn(lbl, "mb-2")}>Activity</div>
              <div className="surface-inset p-3.5 font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
                {meta.log.map((l, i) => <div key={i}><span className="text-[var(--mint)]">&gt;</span> {l}</div>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.filter((s) => s !== task.status).map((s) => (
                <button key={s} onClick={() => { moveTask(task.id, s); }} className="btn btn-secondary btn-sm"><span className="size-1.5 rounded-full" style={{ background: STATUS_UI[s] }} />Move to {STATUS_META[s].label}</button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
