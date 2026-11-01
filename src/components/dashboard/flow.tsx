"use client";

import { useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import type { AgentName, ProjectDetail } from "@/lib/contracts";
import { getAgentSpec } from "@/lib/agent-catalog";
import { subAgentView } from "@/lib/sim";
import { useDash } from "./store";
import { AssignDialog } from "./agents";
import { AgentTag, Bar, Dot, NeedProject, PageHead, Panel, StatusPill, agentColor, cap, codename, lbl } from "./kit";

type NodeId = AgentName | "Brief";
const POS: Record<NodeId, [number, number]> = {
  Brief: [72, 215], Architect: [235, 215], Backend: [415, 120], Frontend: [415, 310], DevOps: [595, 215],
  Docs: [595, 50], QA: [775, 120], Security: [775, 310], Reviewer: [930, 215],
};
const EDGES: [NodeId, NodeId][] = [
  ["Brief", "Architect"], ["Architect", "Backend"], ["Architect", "Frontend"], ["Architect", "Docs"], ["Backend", "DevOps"], ["Frontend", "DevOps"],
  ["DevOps", "QA"], ["DevOps", "Security"], ["QA", "Reviewer"], ["Security", "Reviewer"], ["Docs", "Reviewer"],
];
const W = 130, H = 58;
const nodeColor = (n: NodeId) => (n === "Brief" ? "var(--mint)" : agentColor(n));

function edgePath(a: NodeId, b: NodeId) {
  const [x1, y1] = POS[a], [x2, y2] = POS[b];
  const sx = x1 + W / 2, ex = x2 - W / 2, mx = (sx + ex) / 2;
  return `M${sx} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${ex} ${y2}`;
}

export function FlowGraph({ project, selected, onSelect, compact }: { project: ProjectDetail; selected?: NodeId | null; onSelect?: (n: NodeId) => void; compact?: boolean }) {
  const state = (n: NodeId) => (n === "Brief" ? "done" : project.agents.find((a) => a.name === n)?.status ?? "idle");
  const prog = (n: NodeId) => {
    if (n === "Brief") return 100;
    const ts = project.tasks.filter((t) => t.agent === n);
    return ts.length ? Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length) : 0;
  };
  return (
    <svg viewBox="0 0 1000 380" className="h-auto w-full" role="img" aria-label="Agent pipeline graph">
      <defs>
        <pattern id="fg" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(255,255,255,.07)" /></pattern>
      </defs>
      <rect width="1000" height="380" rx="16" fill="url(#fg)" />
      {EDGES.map(([a, b], i) => {
        const active = state(a) !== "idle";
        const d = edgePath(a, b);
        const col = nodeColor(a);
        return (
          <g key={i}>
            <path d={d} fill="none" strokeWidth="1.5" strokeLinecap="round" style={{ stroke: active ? col : "rgba(255,255,255,.1)", opacity: active ? 0.45 : 1 }} />
            {active && [0, 1].map((k) => (
              <circle key={k} r={compact ? 2.6 : 3} style={{ fill: col }}>
                <animateMotion dur={`${3 + (i % 4) * 0.6}s`} begin={`-${k * 1.5 + i * 0.7}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}
          </g>
        );
      })}
      {(Object.keys(POS) as NodeId[]).map((n) => {
        const [cx, cy] = POS[n];
        const st = state(n);
        const c = nodeColor(n);
        const sel = selected === n;
        const label = n === "Brief" ? "Brief" : codename(n);
        const pr = prog(n);
        return (
          <g
            key={n} transform={`translate(${cx - W / 2} ${cy - H / 2})`} role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined}
            aria-label={`${n} ${st}`} className={onSelect ? "cursor-pointer" : ""}
            onClick={() => onSelect?.(n)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(n); } }}
          >
            {(st === "working" || sel) && <rect x="-5" y="-5" width={W + 10} height={H + 10} rx="19" fill="none" strokeWidth="1.2" className={st === "working" ? "gh-pulse" : ""} style={{ stroke: sel ? "var(--mint)" : c, opacity: sel ? 0.7 : 0.35 }} />}
            <rect width={W} height={H} rx="14" strokeWidth="1" style={{ fill: "var(--surface-3)", stroke: "rgba(255,255,255,0.09)", opacity: st === "idle" ? 0.78 : 1 }} />
            <circle cx="17" cy="20.5" r="4.5" style={{ fill: c }} />
            <text x="31" y="25" fontSize="15" fontWeight="600" style={{ fill: "var(--text)", fontFamily: "var(--font-grotesk), var(--font-body), sans-serif" }}>{label}</text>
            <text x="17" y="41" fontSize="11.5" style={{ fill: "var(--text-faint)", fontFamily: "var(--font-body), sans-serif" }}>{n === "Brief" ? "Input" : `${st} · ${pr}%`}</text>
            <circle cx={W - 15} cy="20" r="3" style={{ fill: st === "working" ? "var(--amber)" : st === "done" ? "var(--mint)" : "var(--text-faint)" }} />
            <rect x="17" y={H - 8} width={W - 34} height="2.5" rx="1.25" fill="rgba(255,255,255,.08)" />
            <rect x="17" y={H - 8} width={((W - 34) * pr) / 100} height="2.5" rx="1.25" style={{ fill: c }} />
          </g>
        );
      })}
    </svg>
  );
}

export function FlowView() {
  const { project, tick, setLogsAgent } = useDash();
  const [sel, setSel] = useState<NodeId | null>(null);
  const [assign, setAssign] = useState<AgentName | null>(null);
  if (!project) return <NeedProject />;
  const active: NodeId = sel ?? project.agents.find((a) => a.status === "working")?.name ?? "Architect";
  return (
    <>
      <PageHead title="Flow" description="How work moves through the crew. Select a node to inspect an agent; packets show hand-offs in motion." />
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <Panel title="Agent graph" live className="reveal reveal-1 xl:self-start" bodyClass="overflow-x-auto !p-3">
          <div className="min-w-[700px]"><FlowGraph project={project} selected={active} onSelect={setSel} /></div>
        </Panel>
        <Panel title={active === "Brief" ? "Project brief" : `${cap(getAgentSpec(active).codename)} / ${active}`} className="reveal reveal-2" bodyClass="space-y-5">
          {active === "Brief" ? (
            <>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{project.brief}</p>
              <div className="flex flex-wrap gap-1.5">{project.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
              <p className="text-[13px] text-[var(--text-faint)]">The brief feeds Atlas, which fans work out to the rest of the crew.</p>
            </>
          ) : (
            <NodePanel project={project} name={active} tick={tick} onAssign={() => setAssign(active)} onLogs={() => setLogsAgent(active)} />
          )}
        </Panel>
      </div>
      <AssignDialog agent={assign} onClose={() => setAssign(null)} />
    </>
  );
}

function NodePanel({ project, name, tick, onAssign, onLogs }: { project: ProjectDetail; name: AgentName; tick: number; onAssign: () => void; onLogs: () => void }) {
  const spec = getAgentSpec(name);
  const st = project.agents.find((a) => a.name === name);
  const tasks = project.tasks.filter((t) => t.agent === name);
  const c = agentColor(name);
  return (
    <>
      <p className="text-sm text-[var(--text-muted)]">{spec.tagline}</p>
      <div className="flex items-center gap-2 text-[13px]"><Dot color={st?.status === "working" ? c : "var(--text-faint)"} pulse={st?.status === "working"} /><span className="capitalize">{st?.status ?? "idle"}</span><AgentTag name={name} className="ml-auto" /></div>
      <div className="rounded-xl bg-black/25 p-3.5 text-[13px]"><span className="text-[var(--text-faint)]">Current task</span><p className="mt-1 font-medium">{st?.currentTask ?? "No running task"}</p></div>
      <div>
        <div className={`${lbl} mb-2.5`}>Side agents</div>
        <ul className="grid gap-3">
          {spec.subAgents.map((s) => {
            const v = subAgentView(project, name, s, tick);
            return (
              <li key={s.id} className="text-[13px]">
                <div className="flex items-center gap-2"><span className="font-medium">{s.name}</span><span className="ml-auto text-xs capitalize text-[var(--text-faint)]">{v.status}</span></div>
                <Bar value={v.progress} color={c} className="mt-1.5" />
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <div className={`${lbl} mb-2.5`}>Tasks ({tasks.length})</div>
        <ul className="grid gap-2">
          {tasks.map((t) => <li key={t.id} className="flex items-center gap-2 text-[13px]"><span className="min-w-0 flex-1 truncate">{t.title}</span><StatusPill status={t.status} /></li>)}
          {!tasks.length && <li className="text-[13px] text-[var(--text-faint)]">No tasks yet - assign one.</li>}
        </ul>
      </div>
      <div className="flex gap-2">
        <button onClick={onAssign} className="btn btn-primary btn-sm flex-1"><Plus className="size-3.5" /> Assign</button>
        <button onClick={onLogs} className="btn btn-secondary btn-sm flex-1"><ScrollText className="size-3.5" /> Logs</button>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text-faint)]">Tools: {spec.tools.join(" / ")} · Output: {spec.produces}</p>
    </>
  );
}
