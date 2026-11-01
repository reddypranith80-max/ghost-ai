"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, GitBranch } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AgentName, GitLog } from "@/lib/contracts";
import { AGENTS } from "@/lib/contracts";
import { commitFiles } from "@/lib/sim";
import { useDash } from "./store";
import { AgentTag, Empty, NeedProject, PageHead, Panel, agentColor, codename, fmtTime, lbl, optionCls, selectField } from "./kit";

export function GitView() {
  const { project, toast, runNext } = useDash();
  const [agent, setAgent] = useState<"all" | AgentName>("all");
  const [open, setOpen] = useState<GitLog | null>(null);
  const commits = useMemo(() => [...(project?.gitlog ?? [])].reverse(), [project]);
  if (!project) return <NeedProject />;
  const shown = commits.filter((c) => agent === "all" || c.agent === agent);
  const maxN = Math.max(1, ...AGENTS.map((a) => commits.filter((c) => c.agent === a).length));
  const copy = async (hash: string) => {
    try { await navigator.clipboard.writeText(hash); toast({ title: "Hash copied", body: hash, kind: "info" }); }
    catch { toast({ title: "Copy blocked by browser", body: hash, kind: "warn" }); }
  };
  return (
    <>
      <PageHead title="Git Log" description={`${commits.length} commits merged by the crew into ${project.name}.`}>
        <select value={agent} onChange={(e) => setAgent(e.target.value as "all" | AgentName)} aria-label="Filter by agent" className={cn(selectField, "!w-auto")}>
          <option value="all" className={optionCls}>All agents</option>
          {AGENTS.map((a) => <option key={a} value={a} className={optionCls}>{codename(a)} ({a})</option>)}
        </select>
      </PageHead>
      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <Panel title="History" icon={<GitBranch />} className="reveal reveal-1" bodyClass="!px-3 !pb-3">
          {shown.length ? (
            <ul className="relative">
              <span aria-hidden className="absolute bottom-4 left-[21px] top-4 w-px bg-gradient-to-b from-white/[0.14] via-white/[0.08] to-transparent" />
              {shown.map((c) => (
                <li key={c.id} className="group relative flex items-center gap-4 rounded-xl py-3 pl-2 pr-2 transition-colors duration-150 hover:bg-white/[0.035]">
                  <span className="relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--surface-1)]">
                    <span className="size-2.5 rounded-full ring-[3px] ring-[var(--surface-1)]" style={{ background: agentColor(c.agent) }} />
                  </span>
                  <button onClick={() => setOpen(c)} className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-foreground">{c.message}</span>
                    <code className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs text-[var(--text-muted)]">{c.hash}</code>
                  </button>
                  <AgentTag name={c.agent} className="hidden md:inline-flex" />
                  <span className="hidden text-[13px] text-[var(--text-faint)] lg:inline">{c.files} files</span>
                  <span className="hidden text-xs tabular-nums text-[var(--text-faint)] sm:inline">{fmtTime(c.at)}</span>
                  <button onClick={() => void copy(c.hash)} aria-label={`Copy ${c.hash}`} className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-white/[0.08] hover:text-foreground"><Copy className="size-3.5" /></button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={<GitBranch />} title={commits.length ? "No commits for this agent" : "No commits yet"} hint={commits.length ? "Try another agent filter." : "Agents commit as soon as a task is merged. Run a step to see the first one land."}
              action={commits.length ? <button onClick={() => setAgent("all")} className="btn btn-secondary btn-sm">Show all</button> : <button onClick={() => void runNext()} className="btn btn-primary btn-sm">Run next step</button>} />
          )}
        </Panel>
        <Panel title="Commits by agent" className="reveal reveal-2 xl:self-start">
          <ul className="-mx-2 grid gap-0.5">
            {AGENTS.map((a) => {
              const n = commits.filter((c) => c.agent === a).length;
              return (
                <li key={a}>
                  <button onClick={() => setAgent(agent === a ? "all" : a)} className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] transition-colors duration-150 hover:bg-white/[0.05]", agent === a && "bg-white/[0.08]")}>
                    <span className="size-2 rounded-full" style={{ background: agentColor(a) }} />
                    <span className="w-14 text-left font-medium">{codename(a)}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(n / maxN) * 100}%`, background: agentColor(a) }} /></div>
                    <span className="w-5 text-right tabular-nums text-[var(--text-muted)]">{n}</span>
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
              <DialogTitle className="pr-8 font-display text-xl leading-snug">{commit.message}</DialogTitle>
              <DialogDescription>Authored by the {commit.agent} agent on {fmtTime(commit.at)} UTC</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2.5">
              <code className="rounded-lg bg-black/30 px-2.5 py-1.5 font-mono text-sm text-[var(--mint)]">{commit.hash}</code>
              <button onClick={async () => { await onCopy(commit.hash); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn btn-secondary btn-sm">
                {copied ? <Check className="size-3.5 text-[var(--mint)]" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy hash"}
              </button>
              <AgentTag name={commit.agent} className="ml-auto" />
            </div>
            <div className={lbl}>Files changed ({files.length}) <span className="text-[var(--text-faint)]">·</span> <span className="text-[var(--mint)]">+{files.reduce((s, f) => s + f.add, 0)}</span> <span className="text-[var(--coral)]">-{files.reduce((s, f) => s + f.del, 0)}</span></div>
            <ul className="surface-inset grid gap-1 p-3 font-mono text-xs">
              {files.map((f) => (
                <li key={f.path} className="flex items-center gap-2.5 rounded-md px-1.5 py-1"><FileCode2 className="size-3.5 shrink-0 text-[var(--text-faint)]" /><span className="min-w-0 flex-1 truncate">{f.path}</span><span className="text-[var(--mint)]">+{f.add}</span><span className="text-[var(--coral)]">-{f.del}</span></li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
