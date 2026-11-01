"use client";

import { useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import type { AgentName, ProjectDetail } from "@/lib/contracts";
import { getAgentSpec } from "@/lib/agent-catalog";
import { agentHex, subAgentView } from "@/lib/sim";
import { useDash } from "./store";
import { AssignDialog } from "./agents";
import { AgentTag, Bar, Dot, NeedProject, PageHead, Panel, StatusPill, hud } from "./kit";
import { cn } from "cn";

type NodeId = AgentName | "Brief";
const POS: Record<NodeId, [number, number]> = {
  Brief: [70, 215], Architect: [230, 215], Backend: [410, 120], Frontend: [410, 310], DevOps: [590, 215],
  Docs: [590, 50], QA: [760, 120], Security: [760, 310], Reviewer: [915, 215],
};
const EDGES: [NodeId, NodeId][] = [
  ["Brief", "Architect"], ["Architect", "Backend"], ["Architect", "Frontend"], ["Architect", "Docs"], ["Backend", "DevOps"], ["Frontend", "DevOps"],
  ["DevOps", "QA"], ["DevOps", "Security"], ["QA", "Reviewer"], ["Security", "Reviewer"], ["Docs", "Reviewer"],
];
const W = 124, H = 50;

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
    <svg viewBox="0 0 990 380" className="h-auto w-full" role="img" aria-label="Agent pipeline graph">
      <defs>
        <pattern id="fg" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(140,170,255,.18)" /></pattern>
      </defs>
      <rect width="990" height="380" fill="url(#fg)" />
      {EDGES.map(([a, b], i) => {
        const active = state(a) !== "idle";
        const d = edgePath(a, b);
        const col = a === "Brief" ? "#22e5ff" : agentHex(a as AgentName);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={active ? col : "rgba(140,160,220,.25)"} strokeWidth={active ? 1.6 : 1} opacity={active ? 0.8 : 1} />
            {active && !compact && <path d={d} fill="none" stroke={col} strokeWidth="1.6" className="gh-flow" opacity=".9" />}
            {active && [0, 1].map((k) => (
              <circle key={k} r={compact ? 3 : 3.6} fill={col} style={{ filter: `drop-shadow(0 0 5px ${col})` }}>
                <animateMotion dur={`${2.4 + (i % 4) * 0.5}s`} begin={`${k * 1.2 + i * 0.2}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}
          </g>
        );
      })}
      {(Object.keys(POS) as NodeId[]).map((n) => {
        const [cx, cy] = POS[n];
        const st = state(n);
        const c = n === "Brief" ? "#22e5ff" : agentHex(n);
        const sel = selected === n;
        const label = n === "Brief" ? "BRIEF" : getAgentSpec(n).codename;
        return (
          <g
            key={n} transform={`translate(${cx - W / 2} ${cy - H / 2})`} role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined}
            aria-label={`${n} ${st}`} className={onSelect ? "cursor-pointer outline-none" : ""}
            onClick={() => onSelect?.(n)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(n); } }}
          >
            {st === "working" && <rect x="-4" y="-4" width={W + 8} height={H + 8} rx="8" fill="none" stroke={c} opacity=".35" className="gh-pulse" />}
            <rect width={W} height={H} rx="6" fill="#0a0d1c" stroke={sel ? "#fff" : c} strokeWidth={sel ? 2 : 1.2} opacity={st === "idle" ? 0.7 : 1} />
            <rect width="4" height={H} rx="2" fill={c} />
            <text x="16" y="21" fill={c} fontSize="13" fontWeight="700" fontFamily="var(--font-grotesk), sans-serif" letterSpacing="1.5">{label}</text>
            <text x="16" y="36" fill="#8b93b8" fontSize="9.5" fontFamily="var(--font-code), monospace">{n === "Brief" ? "input" : `${st} / ${prog(n)}%`}</text>
            <circle cx={W - 14} cy="16" r="4" fill={st === "working" ? c : st === "done" ? "#34d399" : "#64748b"} />
            <rect x="16" y={H - 7} width={W - 32} height="2.5" rx="1.2" fill="rgba(255,255,255,.1)" />
            <rect x="16" y={H - 7} width={((W - 32) * prog(n)) / 100} height="2.5" rx="1.2" fill={c} />
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
      <PageHead kicker={`Pipeline / ${project.name}`} title="Flow">
        <span className="font-mono text-xs text-muted-foreground">Click a node. Packets show work moving between agents.</span>
      </PageHead>
      <div className="grid gap-3.5 xl:grid-cols-[1fr_22rem]">
        <Panel title="Agent graph" live bodyClass="overflow-x-auto p-0">
          <div className="min-w-[680px] p-2"><FlowGraph project={project} selected={active} onSelect={setSel} /></div>
        </Panel>
        <Panel title={active === "Brief" ? "Project brief" : `${getAgentSpec(active).codename} / ${active}`} bodyClass="space-y-3">
          {active === "Brief" ? (
            <>
              <p className="text-sm text-muted-foreground">{project.brief}</p>
              <div className="flex flex-wrap gap-1">{project.stack.map((s) => <span key={s} className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--acc)]">{s}</span>)}</div>
              <p className="text-xs text-muted-foreground">The brief feeds ATLAS, which fans work out to the rest of the crew.</p>
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
  const c = agentHex(name);
  return (
    <>
      <p className="text-sm text-muted-foreground">{spec.tagline}</p>
      <div className="flex items-center gap-2 text-xs"><Dot color={st?.status === "working" ? c : "#64748b"} pulse={st?.status === "working"} /><span className="font-mono uppercase">{st?.status ?? "idle"}</span><AgentTag name={name} className="ml-auto" /></div>
      <div className="rounded-md border border-[var(--gh-line)] bg-black/20 p-2.5 text-xs"><span className={hud}>Current task</span><p className="mt-1">{st?.currentTask ?? "No running task"}</p></div>
      <div>
        <div className={cn(hud, "mb-1.5")}>Side agents</div>
        <ul className="grid gap-2">
          {spec.subAgents.map((s) => {
            const v = subAgentView(project, name, s, tick);
            return (
              <li key={s.id} className="text-xs">
                <div className="flex items-center gap-2"><span className="font-medium">{s.name}</span><span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">{v.status}</span></div>
                <Bar value={v.progress} color={c} className="mt-1" />
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <div className={cn(hud, "mb-1.5")}>Tasks ({tasks.length})</div>
        <ul className="grid gap-1">
          {tasks.map((t) => <li key={t.id} className="flex items-center gap-2 text-xs"><span className="min-w-0 flex-1 truncate">{t.title}</span><StatusPill status={t.status} /></li>)}
          {!tasks.length && <li className="text-xs text-muted-foreground">No tasks yet - assign one.</li>}
        </ul>
      </div>
      <div className="flex gap-2">
        <button onClick={onAssign} className="gh-btn gh-btn-primary !h-8 flex-1 text-xs"><Plus className="size-3.5" /> Assign</button>
        <button onClick={onLogs} className="gh-btn gh-btn-ghost !h-8 flex-1 text-xs"><ScrollText className="size-3.5" /> Logs</button>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">Tools: {spec.tools.join(" / ")} - Output: {spec.produces}</p>
    </>
  );
}
