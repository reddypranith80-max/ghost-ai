"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, FileText, Plus, ScrollText, Wrench, X } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AgentName, ProjectDetail } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { AGENT_CATALOG, getAgentSpec } from "@/lib/agent-catalog";
import { agentHex, backlogLines, subAgentView, type LogLine } from "@/lib/sim";
import { useDash } from "./store";
import { Bar, Dot, NeedProject, PageHead, field, fmtClock, hud } from "./kit";

const LEVEL_COLOR: Record<LogLine["level"], string> = { info: "#8b93b8", ok: "#34d399", warn: "#fbbf24", cmd: "#22e5ff" };

export function LogLines({ lines, className }: { lines: LogLine[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);
  return (
    <div ref={ref} className={cn("overflow-y-auto bg-black/30 p-2.5 font-mono text-[11px] leading-relaxed", className)} role="log">
      {lines.map((l) => (
        <div key={l.id} className="flex gap-2 whitespace-pre-wrap break-words">
          <span className="shrink-0 text-muted-foreground/60">{fmtClock(l.t)}</span>
          <span className="shrink-0 font-semibold" style={{ color: agentHex(l.agent) }}>{getAgentSpec(l.agent).codename}</span>
          <span style={{ color: LEVEL_COLOR[l.level] }}>{l.level === "cmd" ? "$ " : l.level === "ok" ? "OK " : l.level === "warn" ? "WARN " : ""}{l.text}</span>
        </div>
      ))}
      <div className="gh-caret text-[var(--acc)]">_</div>
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
  const working = project.agents.filter((a) => a.status === "working").length;
  return (
    <>
      <PageHead kicker={`Crew / ${project.name}`} title="Agents">
        <span className="rounded-md border border-[var(--gh-line)] px-2.5 py-1 font-mono text-xs"><span className="text-[var(--acc)]">{working}</span> working / 8 leads / 24 side agents</span>
        <button onClick={() => setOpen(open.size ? new Set() : new Set(AGENTS))} className="gh-btn gh-btn-ghost !h-8 text-xs">{open.size ? "Collapse all" : "Expand all"}</button>
      </PageHead>
      <div className="grid gap-3.5 md:grid-cols-2 2xl:grid-cols-3">
        {AGENT_CATALOG.map((spec) => {
          const st = project.agents.find((a) => a.name === spec.name);
          const { ts, prog, done } = agentStats(project, spec.name);
          const c = agentHex(spec.name);
          const isOpen = open.has(spec.name);
          return (
            <section key={spec.name} className="gh-glass gh-corners rounded-md" style={{ borderTop: `2px solid ${c}`, boxShadow: st?.status === "working" ? `0 0 28px -14px ${c}` : undefined }}>
              <div className="p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md border font-display text-lg font-bold" style={{ color: c, borderColor: `${c}66`, background: `${c}14` }}>{spec.codename[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold" style={{ color: c }}>{spec.codename}</h3>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">{spec.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{spec.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase">
                    <Dot color={st?.status === "working" ? c : st?.status === "done" ? "#34d399" : "#64748b"} pulse={st?.status === "working"} />
                    {st?.status ?? "idle"}
                  </div>
                </div>
                <div className="mt-3 rounded-md border border-[var(--gh-line)] bg-black/20 px-2.5 py-2 text-xs">
                  <span className="text-muted-foreground">Now: </span>{st?.currentTask ?? (ts.some((t) => t.status === "todo") ? "Queued - waiting for upstream" : done ? "All tasks delivered" : "Standing by")}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Bar value={prog} color={c} />
                  <span className="font-mono text-xs tabular-nums">{prog}%</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{done}/{ts.length} tasks done</div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <Wrench className="size-3 text-muted-foreground" />
                  {spec.tools.map((t) => <span key={t} className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono">{t}</span>)}
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground"><FileText className="mt-0.5 size-3 shrink-0" /> Produces: {spec.produces}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setAssign(spec.name)} className="gh-btn gh-btn-primary !h-8 text-xs"><Plus className="size-3.5" /> Assign task</button>
                  <button onClick={() => setLogsAgent(spec.name)} className="gh-btn gh-btn-ghost !h-8 text-xs"><ScrollText className="size-3.5" /> View logs</button>
                  <button onClick={() => toggle(spec.name)} aria-expanded={isOpen} className="gh-btn gh-btn-ghost !h-8 text-xs sm:ml-auto">
                    Side agents ({spec.subAgents.length}) <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <ul className="divide-y divide-[var(--gh-line)]/60 border-t border-[var(--gh-line)]">
                  {spec.subAgents.map((s) => {
                    const v = subAgentView(project, spec.name, s, tick);
                    const vc = v.status === "working" ? c : v.status === "done" ? "#34d399" : v.status === "queued" ? "#fbbf24" : "#64748b";
                    return (
                      <li key={s.id} className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Bot className="size-3.5" style={{ color: vc }} />
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase" style={{ color: vc }}><Dot color={vc} pulse={v.status === "working"} />{v.status}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.role}</p>
                        <div className="mt-1.5 flex items-center gap-2"><Bar value={v.progress} color={vc} /><span className="font-mono text-[10px] tabular-nums">{v.progress}%</span></div>
                        <div className="mt-1.5 rounded-sm bg-black/30 px-2 py-1 font-mono text-[10px] leading-snug text-muted-foreground">
                          {v.log.map((l, i) => <div key={i} className="truncate"><span className="text-[var(--acc)]">&gt;</span> {l}</div>)}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">Tools: {spec.tools.slice(0, 2).join(", ")} / Output: {spec.produces.split(",")[0].toLowerCase()}</div>
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
          <DialogTitle className="font-display text-lg">Assign task</DialogTitle>
          <DialogDescription>Adds a task to {project?.name ?? "the project"} backlog; {spec.codename} picks it up on the next run.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <label className="grid gap-1 text-xs"><span className={hud}>Agent</span>
            <select value={who} onChange={(e) => setWho(e.target.value as AgentName)} className={field}>
              {AGENT_CATALOG.map((a) => <option key={a.name} value={a.name} className="bg-[#0a0d1c]">{a.codename} - {a.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs"><span className={hud}>Task</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${spec.subAgents[0].role}`} autoFocus />
          </label>
          <div className="flex flex-wrap gap-1">
            {spec.subAgents.map((s) => (
              <button key={s.id} type="button" onClick={() => setTitle(s.role)} className="rounded-full border border-[var(--gh-line)] px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">{s.name}: {s.role}</button>
            ))}
          </div>
          <label className="grid gap-1 text-xs"><span className={hud}>Module</span>
            <select value={module} onChange={(e) => setModule(e.target.value)} className={field}>{MODULES.map((m) => <option key={m} className="bg-[#0a0d1c]">{m}</option>)}</select>
          </label>
          <label className="grid gap-1 text-xs"><span className={hud}>Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={field} placeholder="Acceptance criteria, links, constraints" />
          </label>
          {err && <p className="text-xs text-destructive" role="alert">{err}</p>}
          <button className="gh-btn gh-btn-primary !h-9" type="submit"><Plus className="size-4" /> Assign to {spec.codename}</button>
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
  const c = agentHex(logsAgent);
  const lines = [...backlog, ...feed.filter((l) => l.agent === logsAgent)];
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/55" onClick={() => setLogsAgent(null)} />
      <aside className="absolute inset-y-0 right-0 flex w-[min(30rem,100vw)] flex-col border-l border-[var(--gh-line)] bg-[#070a18] animate-in slide-in-from-right duration-200" role="dialog" aria-label={`${spec.codename} logs`}>
        <header className="flex items-center gap-3 border-b border-[var(--gh-line)] p-3.5">
          <div className="flex size-9 items-center justify-center rounded-md border font-display font-bold" style={{ color: c, borderColor: `${c}66`, background: `${c}14` }}>{spec.codename[0]}</div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold" style={{ color: c }}>{spec.codename} logs</h2>
            <p className="truncate text-xs text-muted-foreground">{project?.name} / live stream</p>
          </div>
          <button onClick={() => setLogsAgent(null)} aria-label="Close logs" className="ml-auto text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </header>
        <LogLines lines={lines} className="min-h-0 flex-1" />
        <div className="border-t border-[var(--gh-line)] p-3">
          <div className={hud}>Side agents</div>
          <ul className="mt-2 grid gap-1.5">
            {project && spec.subAgents.map((s) => {
              const v = subAgentView(project, logsAgent, s, tick);
              return (
                <li key={s.id} className="flex items-center gap-2 text-xs">
                  <Dot color={v.status === "working" ? c : "#64748b"} pulse={v.status === "working"} />
                  <span className="font-medium">{s.name}</span>
                  <span className="truncate text-muted-foreground">{v.log[1]}</span>
                  <span className="ml-auto font-mono tabular-nums">{v.progress}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
