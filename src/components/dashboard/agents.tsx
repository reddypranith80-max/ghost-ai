"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, FileText, Plus, ScrollText, X } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AgentName, ProjectDetail } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { AGENT_CATALOG, getAgentSpec } from "@/lib/agent-catalog";
import { backlogLines, subAgentView, type LogLine } from "@/lib/sim";
import { useDash } from "./store";
import { AgentGlyph, Bar, Dot, NeedProject, PageHead, agentColor, cap, codename, field, fmtClock, lbl, optionCls, selectField, tint } from "./kit";

const LEVEL_COLOR: Record<LogLine["level"], string> = { info: "var(--text-muted)", ok: "var(--mint)", warn: "var(--amber)", cmd: "var(--text)" };

export function LogLines({ lines, className }: { lines: LogLine[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);
  return (
    <div ref={ref} className={cn("surface-inset overflow-y-auto p-3.5 font-mono text-[11.5px] leading-[1.7]", className)} role="log">
      {lines.map((l) => (
        <div key={l.id} className="flex gap-2.5 whitespace-pre-wrap break-words">
          <span className="shrink-0 tabular-nums text-[var(--text-faint)]">{fmtClock(l.t)}</span>
          <span className="shrink-0 font-semibold" style={{ color: agentColor(l.agent) }}>{codename(l.agent)}</span>
          <span style={{ color: LEVEL_COLOR[l.level] }}>{l.level === "cmd" ? "$ " : l.level === "ok" ? "ok " : l.level === "warn" ? "warn " : ""}{l.text}</span>
        </div>
      ))}
      <div className="gh-caret text-[var(--mint)]">_</div>
    </div>
  );
}

function agentStats(p: ProjectDetail, name: AgentName) {
  const ts = p.tasks.filter((t) => t.agent === name);
  const prog = ts.length ? Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length) : 0;
  return { ts, prog, done: ts.filter((t) => t.status === "done").length };
}

export function AgentsView() {
  const { project, tick, setLogsAgent } = useDash();
  const [open, setOpen] = useState<Set<string>>(new Set(["Frontend"]));
  const [assign, setAssign] = useState<AgentName | null>(null);
  if (!project) return <NeedProject />;
  const toggle = (n: string) => setOpen((s) => { const x = new Set(s); if (!x.delete(n)) x.add(n); return x; });
  const workingCount = project.agents.filter((a) => a.status === "working").length;
  return (
    <>
      <PageHead title="Agents" description={`The crew building ${project.name}: eight leads, each with their own side agents.`}>
        <span className="chip"><span className="size-1.5 rounded-full bg-[var(--amber)]" /><span className="font-semibold text-foreground">{workingCount}</span> working · 8 leads · 24 side agents</span>
        <button onClick={() => setOpen(open.size ? new Set() : new Set(AGENTS))} className="btn btn-secondary btn-sm">{open.size ? "Collapse all" : "Expand all"}</button>
      </PageHead>
      <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {AGENT_CATALOG.map((spec, idx) => {
          const st = project.agents.find((a) => a.name === spec.name);
          const { ts, prog, done } = agentStats(project, spec.name);
          const c = agentColor(spec.name);
          const isOpen = open.has(spec.name);
          const working = st?.status === "working";
          return (
            <section key={spec.name} className={cn("surface card-lift reveal relative min-w-0 overflow-hidden rounded-2xl", `reveal-${Math.min(8, (idx % 8) + 1)}`)}>
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full opacity-[0.14] blur-3xl" style={{ background: c }} />
              <div className="relative p-5">
                <div className="flex items-start gap-3.5">
                  <AgentGlyph name={spec.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-[17px] font-semibold tracking-tight">{cap(spec.codename)}</h3>
                      <span className="text-[13px] text-[var(--text-faint)]">{spec.name}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{spec.tagline}</p>
                  </div>
                  <span className="chip" style={working ? { color: c, background: tint(c, 13) } : undefined}>
                    <Dot color={working ? c : st?.status === "done" ? "var(--mint)" : "var(--text-faint)"} pulse={working} />
                    <span className="capitalize">{st?.status ?? "idle"}</span>
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-black/25 px-3.5 py-2.5 text-[13px] leading-snug">
                  <span className="text-[var(--text-faint)]">Now </span>{st?.currentTask ?? (ts.some((t) => t.status === "todo") ? "Queued - waiting for upstream" : done ? "All tasks delivered" : "Standing by")}
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[var(--text-faint)]">{done}/{ts.length} tasks done</span>
                    <span className="font-semibold tabular-nums">{prog}%</span>
                  </div>
                  <Bar value={prog} color={c} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {spec.tools.map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[var(--text-faint)]"><FileText className="mt-0.5 size-3.5 shrink-0" /> Produces: {spec.produces}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button onClick={() => setAssign(spec.name)} className="btn btn-secondary btn-sm"><Plus className="size-3.5 text-[var(--mint)]" /> Assign task</button>
                  <button onClick={() => setLogsAgent(spec.name)} className="btn btn-ghost btn-sm"><ScrollText className="size-3.5" /> View logs</button>
                  <button onClick={() => toggle(spec.name)} aria-expanded={isOpen} className="btn btn-ghost btn-sm sm:ml-auto">
                    Side agents ({spec.subAgents.length}) <ChevronDown className={cn("size-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <ul className="relative mx-2 mb-2 grid gap-1 rounded-xl bg-black/20 p-1.5">
                  {spec.subAgents.map((s) => {
                    const v = subAgentView(project, spec.name, s, tick);
                    const vc = v.status === "working" ? c : v.status === "done" ? "var(--mint)" : v.status === "queued" ? "var(--amber)" : "var(--text-faint)";
                    return (
                      <li key={s.id} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.035]">
                        <div className="flex items-center gap-2">
                          <Bot className="size-3.5" style={{ color: vc }} />
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="ml-auto flex items-center gap-1.5 text-xs capitalize" style={{ color: vc }}><Dot color={vc} pulse={v.status === "working"} />{v.status}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--text-faint)]">{s.role}</p>
                        <div className="mt-2 flex items-center gap-2.5"><Bar value={v.progress} color={vc} /><span className="text-xs tabular-nums text-[var(--text-muted)]">{v.progress}%</span></div>
                        <div className="mt-2 rounded-lg bg-black/30 px-2.5 py-1.5 font-mono text-[10.5px] leading-snug text-[var(--text-muted)]">
                          {v.log.map((l, i) => <div key={i} className="truncate"><span className="text-[var(--mint)]">&gt;</span> {l}</div>)}
                        </div>
                        <div className="mt-1.5 text-[11px] text-[var(--text-faint)]">Tools: {spec.tools.slice(0, 2).join(", ")} / Output: {spec.produces.split(",")[0].toLowerCase()}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <AssignDialog agent={assign} onClose={() => setAssign(null)} />
    </>
  );
}

const MODULES = ["Core", "API", "Auth", "UI", "Billing", "Infra", "Docs", "CRM"];

export function AssignDialog({ agent, onClose }: { agent: AgentName | null; onClose: () => void }) {
  const { assignTask, project } = useDash();
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("Core");
  const [notes, setNotes] = useState("");
  const [who, setWho] = useState<AgentName>("Architect");
  const [err, setErr] = useState("");
  const [lastAgent, setLastAgent] = useState<AgentName | null>(null);
  if (agent && agent !== lastAgent) { setLastAgent(agent); setWho(agent); }
  if (!agent && lastAgent) setLastAgent(null);
  const spec = getAgentSpec(who);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) { setErr("Describe the task (3+ characters)."); return; }
    assignTask({ agent: who, title: title.trim(), module, notes });
    setTitle(""); setNotes(""); setErr("");
    onClose();
  }
  return (
    <Dialog open={!!agent} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Assign task</DialogTitle>
          <DialogDescription>Adds a task to {project?.name ?? "the project"} backlog; {cap(spec.codename)} picks it up on the next run.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-1.5"><span className={lbl}>Agent</span>
            <select value={who} onChange={(e) => setWho(e.target.value as AgentName)} className={selectField}>
              {AGENT_CATALOG.map((a) => <option key={a.name} value={a.name} className={optionCls}>{cap(a.codename)} - {a.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5"><span className={lbl}>Task</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${spec.subAgents[0].role}`} autoFocus />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {spec.subAgents.map((s) => (
              <button key={s.id} type="button" onClick={() => setTitle(s.role)} className="chip cursor-pointer transition-colors hover:bg-white/[0.1] hover:text-foreground">{s.name}: {s.role}</button>
            ))}
          </div>
          <label className="grid gap-1.5"><span className={lbl}>Module</span>
            <select value={module} onChange={(e) => setModule(e.target.value)} className={selectField}>{MODULES.map((m) => <option key={m} className={optionCls}>{m}</option>)}</select>
          </label>
          <label className="grid gap-1.5"><span className={lbl}>Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={field} placeholder="Acceptance criteria, links, constraints" />
          </label>
          {err && <p className="text-[13px] text-[var(--coral)]" role="alert">{err}</p>}
          <button className="btn btn-primary" type="submit"><Plus className="size-4" /> Assign to {cap(spec.codename)}</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LogsDrawer() {
  const { logsAgent, setLogsAgent, feed, project, tick } = useDash();
  const backlog = useMemo(() => (logsAgent ? backlogLines(logsAgent, 12) : []), [logsAgent]);
  if (!logsAgent) return null;
  const spec = getAgentSpec(logsAgent);
  const c = agentColor(logsAgent);
  const lines = [...backlog, ...feed.filter((l) => l.agent === logsAgent)];
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setLogsAgent(null)} />
      <aside className="absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col bg-[var(--surface-1)] shadow-[0_0_0_1px_var(--hairline-strong),var(--shadow-2)] animate-in slide-in-from-right duration-200 sm:inset-y-3 sm:right-3 sm:rounded-2xl" role="dialog" aria-label={`${spec.codename} logs`}>
        <header className="flex items-center gap-3.5 p-5 pb-4">
          <AgentGlyph name={logsAgent} size={40} />
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold leading-tight" style={{ color: c }}>{cap(spec.codename)} logs</h2>
            <p className="truncate text-[13px] text-[var(--text-faint)]">{project?.name} · live stream</p>
          </div>
          <button onClick={() => setLogsAgent(null)} aria-label="Close logs" className="btn btn-ghost !h-9 !w-9 !px-0 ml-auto"><X className="size-[18px]" /></button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col px-3"><LogLines lines={lines} className="min-h-0 flex-1" /></div>
        <div className="p-5">
          <div className="text-[13px] font-medium text-[var(--text-muted)]">Side agents</div>
          <ul className="mt-3 grid gap-2.5">
            {project && spec.subAgents.map((s) => {
              const v = subAgentView(project, logsAgent, s, tick);
              return (
                <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
                  <Dot color={v.status === "working" ? c : "var(--text-faint)"} pulse={v.status === "working"} />
                  <span className="font-medium">{s.name}</span>
                  <span className="truncate text-[var(--text-faint)]">{v.log[1]}</span>
                  <span className="ml-auto tabular-nums text-[var(--text-muted)]">{v.progress}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
