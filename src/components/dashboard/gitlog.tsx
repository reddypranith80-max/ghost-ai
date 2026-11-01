"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, GitBranch } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AgentName, GitLog } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { getAgentSpec } from "@/lib/agent-catalog";
import { agentHex, commitFiles } from "@/lib/sim";
import { useDash } from "./store";
import { AgentTag, Empty, NeedProject, PageHead, Panel, field, fmtTime, hud } from "./kit";

const ROW = 46, LANE = 20;

export function GitView() {
  const { project, toast, runNext } = useDash();
  const [agent, setAgent] = useState<"all" | AgentName>("all");
  const [open, setOpen] = useState<GitLog | null>(null);
  const commits = useMemo(() => [...(project?.gitlog ?? [])].reverse(), [project]);
  const lanes = useMemo(() => ["main", ...AGENTS.filter((a) => commits.some((c) => c.agent === a))], [commits]);
  if (!project) return <NeedProject />;
  const shown = commits.filter((c) => agent === "all" || c.agent === agent);
  const gw = lanes.length * LANE + 14;
  const laneX = (l: string) => 12 + lanes.indexOf(l) * LANE;
  const copy = async (hash: string) => {
    try { await navigator.clipboard.writeText(hash); toast({ title: "Hash copied", body: hash, kind: "info" }); }
    catch { toast({ title: "Copy blocked by browser", body: hash, kind: "warn" }); }
  };
  return (
    <>
      <PageHead kicker={`History / ${project.name}`} title="Git Log">
        <select value={agent} onChange={(e) => setAgent(e.target.value as "all" | AgentName)} aria-label="Filter by agent" className={cn(field, "w-auto")}>
          <option value="all" className="bg-[#0a0d1c]">All agents</option>
          {AGENTS.map((a) => <option key={a} value={a} className="bg-[#0a0d1c]">{getAgentSpec(a).codename} ({a})</option>)}
        </select>
      </PageHead>
      <div className="grid gap-3.5 xl:grid-cols-[1fr_18rem]">
        <Panel title="Branch graph" icon={<GitBranch />} bodyClass="p-0">
          {shown.length ? (
            <div className="overflow-x-auto">
              <div className="relative min-w-[560px]" style={{ height: shown.length * ROW }}>
                <svg className="absolute left-0 top-0" width={gw} height={shown.length * ROW} aria-hidden>
                  {lanes.map((l) => (
                    <line key={l} x1={laneX(l)} x2={laneX(l)} y1={0} y2={shown.length * ROW} stroke={l === "main" ? "rgba(34,229,255,.4)" : `${agentHex(l as AgentName)}33`} strokeWidth={l === "main" ? 2 : 1} strokeDasharray={l === "main" ? "" : "3 4"} />
                  ))}
                  {shown.map((c, i) => {
                    const y = i * ROW + ROW / 2, x = laneX(c.agent), x0 = laneX("main"), col = agentHex(c.agent);
                    return (
                      <g key={c.id}>
                        <path d={`M${x} ${y} C${x} ${y + 14}, ${x0} ${y + 6}, ${x0} ${y + 20}`} fill="none" stroke={col} strokeWidth="1.5" opacity=".7" />
                        <circle cx={x} cy={y} r="5" fill="#05060d" stroke={col} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${col})` }} />
                        <circle cx={x0} cy={y + 20} r="2.5" fill="#22e5ff" />
                      </g>
                    );
                  })}
                </svg>
                <ul style={{ paddingLeft: gw }}>
                  {shown.map((c) => (
                    <li key={c.id} style={{ height: ROW }} className="flex items-center gap-3 border-b border-[var(--gh-line)]/40 pr-3 hover:bg-white/[0.03]">
                      <button onClick={() => setOpen(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <code className="font-mono text-xs text-[var(--acc)]">{c.hash}</code>
                        <span className="min-w-0 flex-1 truncate text-sm">{c.message}</span>
                      </button>
                      <AgentTag name={c.agent} className="hidden sm:inline-flex" />
                      <span className="hidden font-mono text-[10px] text-muted-foreground md:inline">{c.files} files</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{fmtTime(c.at)}</span>
                      <button onClick={() => void copy(c.hash)} aria-label={`Copy ${c.hash}`} className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"><Copy className="size-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <Empty icon={<GitBranch />} title={commits.length ? "No commits for this agent" : "No commits yet"} hint={commits.length ? "Try another agent filter." : "Agents commit as soon as a task is merged. Run a step to see the first one land."}
                action={commits.length ? <button onClick={() => setAgent("all")} className="gh-btn gh-btn-ghost mt-2 !h-8 text-xs">Show all</button> : <button onClick={() => void runNext()} className="gh-btn gh-btn-primary mt-2 !h-8 text-xs">Run next step</button>} />
            </div>
          )}
        </Panel>
        <Panel title="Commits by agent">
          <ul className="grid gap-2">
            {AGENTS.map((a) => {
              const n = commits.filter((c) => c.agent === a).length;
              return (
                <li key={a}>
                  <button onClick={() => setAgent(agent === a ? "all" : a)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-white/5", agent === a && "bg-white/10")}>
                    <span className="size-2 rounded-full" style={{ background: agentHex(a) }} />
                    <span>{getAgentSpec(a).codename}</span>
                    <div className="mx-1 h-1.5 flex-1 rounded bg-white/5"><div className="h-full rounded" style={{ width: `${Math.min(100, n * 22)}%`, background: agentHex(a) }} /></div>
                    <span className="font-mono tabular-nums">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <CommitDialog commit={open} onClose={() => setOpen(null)} onCopy={copy} />
    </>
  );
}

function CommitDialog({ commit, onClose, onCopy }: { commit: GitLog | null; onClose: () => void; onCopy: (h: string) => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  const files = commit ? commitFiles(commit) : [];
  return (
    <Dialog open={!!commit} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {commit && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6 font-display text-lg">{commit.message}</DialogTitle>
              <DialogDescription>Authored by the {commit.agent} agent on {fmtTime(commit.at)} UTC</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <code className="rounded-md border border-[var(--gh-line)] bg-black/30 px-2 py-1 font-mono text-sm text-[var(--acc)]">{commit.hash}</code>
              <button onClick={async () => { await onCopy(commit.hash); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="gh-btn gh-btn-ghost !h-8 text-xs">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy hash"}
              </button>
              <AgentTag name={commit.agent} className="ml-auto" />
            </div>
            <div className={hud}>Files changed ({files.length}) / +{files.reduce((s, f) => s + f.add, 0)} -{files.reduce((s, f) => s + f.del, 0)}</div>
            <ul className="grid gap-1 rounded-md bg-black/30 p-2.5 font-mono text-xs">
              {files.map((f) => (
                <li key={f.path} className="flex items-center gap-2"><FileCode2 className="size-3.5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate">{f.path}</span><span className="text-emerald-400">+{f.add}</span><span className="text-rose-400">-{f.del}</span></li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
