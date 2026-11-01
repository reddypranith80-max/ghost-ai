"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, BarChart3, GitCommit, Network, Play, Radio, Target, Terminal } from "lucide-react";
import { STATUS_META, STATUS_ORDER, agentHex, sparkline } from "@/lib/sim";
import { useDash } from "./store";
import { FlowGraph } from "./flow";
import { LogLines } from "./agents";
import { NeedProject, PageHead, Panel, Ring, Sparkline, fmtTime, hud } from "./kit";

export function OverviewView() {
  const { project, feed, runNext, running, source, setLogsAgent } = useDash();
  const stats = useMemo(() => {
    if (!project) return null;
    const total = project.tasks.length;
    const done = project.tasks.filter((t) => t.status === "done").length;
    const prog = total ? Math.round(project.tasks.reduce((s, t) => s + t.progress, 0) / total) : 0;
    return { total, done, prog, working: project.agents.filter((a) => a.status === "working").length, running: project.tasks.filter((t) => t.status === "running").length };
  }, [project]);
  if (!project || !stats) return <NeedProject />;
  const counts = STATUS_ORDER.map((s) => ({ s, n: project.tasks.filter((t) => t.status === s).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));
  const kpis = [
    { label: "Tasks done", value: `${stats.done}/${stats.total}`, delta: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% complete`, seed: "done", trend: 0.75, color: "#34d399", icon: Target },
    { label: "Agents working", value: `${stats.working}/8`, delta: `${stats.running} tasks in flight`, seed: "work", trend: 0.55, color: "var(--acc)", icon: Radio },
    { label: "Commits", value: String(project.gitlog.length), delta: `last ${project.gitlog.at(-1)?.hash ?? "-"}`, seed: "commits", trend: 0.8, color: "#a06bff", icon: GitCommit },
    { label: "Build health", value: `${Math.min(99, 82 + (stats.done % 15))}%`, delta: "checks passing", seed: "health", trend: 0.6, color: "#fbbf24", icon: Activity },
  ];
  const recent = [...project.gitlog].reverse().slice(0, 6);
  return (
    <>
      <PageHead kicker={`Mission control / ${project.status}`} title={project.name}>
        <span className="rounded-md border border-[var(--gh-line)] px-2.5 py-1 font-mono text-[11px] uppercase">{source === "live" ? "live api" : "simulation"}</span>
        <button onClick={() => void runNext()} disabled={running} className="gh-btn gh-btn-primary">
          <Play className="size-4" /> {running ? "Executing..." : "Run next step"}
        </button>
      </PageHead>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="gh-glass gh-corners rounded-md p-3.5">
            <div className="flex items-center justify-between"><span className={hud}>{k.label}</span><k.icon className="size-3.5 text-muted-foreground" /></div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">{k.value}</div>
                <div className="truncate text-[11px] text-muted-foreground">{k.delta}</div>
              </div>
              <Sparkline data={sparkline(project.id + k.seed + stats.done, 14, k.trend)} color={k.color} w={72} h={30} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 grid gap-3.5 xl:grid-cols-3">
        <Panel title="Mission progress" icon={<Target />} className="xl:col-span-1">
          <div className="flex flex-wrap items-center gap-4">
            <Ring value={stats.prog} label="overall" />
            <div className="min-w-0 flex-1 basis-40">
              <p className="text-sm text-muted-foreground">{project.brief}</p>
              <div className="mt-2 flex flex-wrap gap-1">{project.stack.map((s) => <span key={s} className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--acc)]">{s}</span>)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {project.agents.map((a) => (
              <button key={a.name} onClick={() => setLogsAgent(a.name)} title={`${a.name}: ${a.status}`} className="rounded-sm border border-[var(--gh-line)] py-1 text-center font-mono text-[9px] uppercase hover:bg-white/5" style={{ color: agentHex(a.name), opacity: a.status === "idle" ? 0.55 : 1 }}>
                {a.name.slice(0, 4)}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Agent activity" icon={<Terminal />} live className="xl:col-span-2" bodyClass="p-0">
          <LogLines lines={feed.length ? feed : []} className="h-64 rounded-b-md" />
        </Panel>

        <Panel title="Pipeline" icon={<Network />} right={<Link href="/dashboard/flow" className="text-[11px] text-[var(--acc)] hover:underline">Open flow</Link>} className="xl:col-span-2" bodyClass="p-1.5">
          <div className="overflow-x-auto"><div className="min-w-[520px]"><FlowGraph project={project} compact /></div></div>
        </Panel>

        <Panel title="Tasks by status" icon={<BarChart3 />} right={<Link href="/dashboard/tasks" className="text-[11px] text-[var(--acc)] hover:underline">Board</Link>}>
          <ul className="grid gap-2.5">
            {counts.map(({ s, n }) => (
              <li key={s} className="grid grid-cols-[4.5rem_1fr_1.5rem] items-center gap-2 text-xs">
                <span className="text-muted-foreground">{STATUS_META[s].label}</span>
                <div className="h-3 rounded-sm bg-white/5"><div className="h-full rounded-sm transition-[width] duration-700" style={{ width: `${(n / max) * 100}%`, background: STATUS_META[s].color, boxShadow: `0 0 10px ${STATUS_META[s].color}66` }} /></div>
                <span className="text-right font-mono tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent commits" icon={<GitCommit />} right={<Link href="/dashboard/git" className="text-[11px] text-[var(--acc)] hover:underline">All</Link>} className="xl:col-span-3" bodyClass="p-0">
          <ul className="divide-y divide-[var(--gh-line)]/60">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3.5 py-2 text-sm">
                <span className="size-2 shrink-0 rounded-full" style={{ background: agentHex(c.agent) }} />
                <code className="font-mono text-xs text-[var(--acc)]">{c.hash}</code>
                <span className="min-w-0 flex-1 truncate">{c.message}</span>
                <span className="hidden font-mono text-[10px] uppercase text-muted-foreground sm:inline">{c.agent} / {c.files} files</span>
                <span className="font-mono text-[10px] text-muted-foreground">{fmtTime(c.at)}</span>
              </li>
            ))}
            {!recent.length && <li className="px-3.5 py-6 text-center text-sm text-muted-foreground">No commits yet. Press <b>Run next step</b> and the first merge will land here.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
