"use client";

import { useMemo } from "react";
import { Activity, GitCommit, Play, Radio, Target } from "lucide-react";
import { STATUS_META, STATUS_ORDER, sparkline } from "@/lib/sim";
import { useDash } from "./store";
import { FlowGraph } from "./flow";
import { LogLines } from "./agents";
import { NeedProject, PageHead, Panel, Ring, SoftLink, Sparkline, STATUS_UI, agentColor, codename, fmtTime, tint } from "./kit";

export function OverviewView() {
  const { project, feed, runNext, running, source, setLogsAgent, loading } = useDash();
  const stats = useMemo(() => {
    if (!project) return null;
    const total = project.tasks.length;
    const done = project.tasks.filter((t) => t.status === "done").length;
    const prog = total ? Math.round(project.tasks.reduce((s, t) => s + t.progress, 0) / total) : 0;
    return { total, done, prog, working: project.agents.filter((a) => a.status === "working").length, running: project.tasks.filter((t) => t.status === "running").length };
  }, [project]);
  if (!project || !stats) return <NeedProject loading={loading} />;
  const counts = STATUS_ORDER.map((s) => ({ s, n: project.tasks.filter((t) => t.status === s).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));
  const kpis = [
    { label: "Tasks done", value: `${stats.done}/${stats.total}`, delta: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% complete`, seed: "done", trend: 0.75, color: "var(--mint)", icon: Target },
    { label: "Agents working", value: `${stats.working}/8`, delta: `${stats.running} tasks in flight`, seed: "work", trend: 0.55, color: "var(--amber)", icon: Radio },
    { label: "Commits", value: String(project.gitlog.length), delta: `last ${project.gitlog.at(-1)?.hash ?? "-"}`, seed: "commits", trend: 0.8, color: "var(--blue)", icon: GitCommit },
    { label: "Build health", value: `${Math.min(99, 82 + (stats.done % 15))}%`, delta: "checks passing", seed: "health", trend: 0.6, color: "var(--agent-fuchsia)", icon: Activity },
  ];
  const recent = [...project.gitlog].reverse().slice(0, 6);
  return (
    <>
      <PageHead title={project.name} description={`${project.status === "shipped" ? "Shipped" : project.status === "building" ? "Building" : "Planning"} · ${project.brief}`}>
        <span className={source === "live" ? "chip chip-mint" : "chip"}>
          <span className="size-1.5 rounded-full" style={{ background: source === "live" ? "var(--mint)" : "var(--text-faint)" }} />
          {source === "live" ? "Live API" : "Simulation"}
        </span>
        <button onClick={() => void runNext()} disabled={running} className="btn btn-primary disabled:opacity-70">
          <Play className="size-4" /> {running ? "Executing..." : "Run next step"}
        </button>
      </PageHead>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`gh-glass !bg-[var(--surface-1)] reveal reveal-${i + 1} relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden !rounded-2xl p-5`}>
            <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]">
              <span className="flex size-6 items-center justify-center rounded-lg" style={{ background: tint(k.color, 14), color: k.color }}><k.icon className="size-3.5" /></span>
              {k.label}
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-[2.25rem]">{k.value}</div>
                <div className="mt-2 truncate text-xs text-[var(--text-faint)]">{k.delta}</div>
              </div>
              <div className="hidden sm:block"><Sparkline data={sparkline(project.id + k.seed + stats.done, 14, k.trend)} color={k.color} w={72} h={34} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Mission progress" className="reveal reveal-5 xl:col-span-1">
          <div className="flex flex-wrap items-center gap-5">
            <Ring value={stats.prog} label="overall" />
            <div className="min-w-0 flex-1 basis-40">
              <p className="line-clamp-4 text-sm leading-relaxed text-[var(--text-muted)]">{project.brief}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{project.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {project.agents.map((a) => (
              <button key={a.name} onClick={() => setLogsAgent(a.name)} title={`${a.name}: ${a.status}`}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.035] py-2.5 text-[11px] font-medium transition-[background,transform] duration-150 hover:-translate-y-0.5 hover:bg-white/[0.07]"
                style={{ opacity: a.status === "idle" ? 0.6 : 1 }}>
                <span className="size-2 rounded-full" style={{ background: agentColor(a.name) }} />
                <span className="text-[var(--text-muted)]">{codename(a.name)}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Agent activity" live className="reveal reveal-6 flex flex-col xl:col-span-2" bodyClass="!p-2 !pt-2 flex flex-1 flex-col">
          <LogLines lines={feed.length ? feed : []} className="min-h-64 flex-1 rounded-xl" />
        </Panel>

        <Panel title="Pipeline" right={<SoftLink href="/dashboard/flow">Open flow</SoftLink>} className="reveal reveal-7 xl:col-span-2" bodyClass="!p-3">
          <div className="overflow-x-auto"><div className="min-w-[560px]"><FlowGraph project={project} compact /></div></div>
        </Panel>

        <Panel title="Tasks by status" right={<SoftLink href="/dashboard/tasks">Board</SoftLink>} className="reveal reveal-8">
          <ul className="grid gap-4 pt-1">
            {counts.map(({ s, n }) => (
              <li key={s} className="grid gap-1.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-muted)]"><span className="size-1.5 rounded-full" style={{ background: STATUS_UI[s] }} />{STATUS_META[s].label}</span>
                  <span className="font-medium tabular-nums">{n}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(n / max) * 100}%`, background: STATUS_UI[s] }} /></div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent commits" right={<SoftLink href="/dashboard/git">View all</SoftLink>} className="xl:col-span-3" bodyClass="!px-2 !pb-2">
          <ul>
            {recent.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.035]">
                <span className="size-2 shrink-0 rounded-full" style={{ background: agentColor(c.agent) }} />
                <span className="min-w-0 flex-1 truncate font-medium">{c.message}</span>
                <code className="hidden rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs text-[var(--text-muted)] sm:inline">{c.hash}</code>
                <span className="hidden text-[13px] text-[var(--text-faint)] md:inline">{codename(c.agent)} · {c.files} files</span>
                <span className="text-xs tabular-nums text-[var(--text-faint)]">{fmtTime(c.at)}</span>
              </li>
            ))}
            {!recent.length && <li className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No commits yet. Press <b className="font-semibold text-foreground">Run next step</b> and the first merge will land here.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
