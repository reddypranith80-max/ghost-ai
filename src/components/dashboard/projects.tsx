"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, FolderGit2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectDetail } from "@/lib/contracts";
import { agentHex, sparkline } from "@/lib/sim";
import { useDash } from "./store";
import { Bar, Dot, Empty, PageHead, Sparkline, fmtTime } from "./kit";
import { cn } from "cn";

const STATUS_COLOR = { planning: "#fbbf24", building: "#22e5ff", shipped: "#34d399" } as const;

export function ProjectsView() {
  const { projects, project, selectProject, setNewOpen, renameProject, deleteProject } = useDash();
  const router = useRouter();
  const [edit, setEdit] = useState<{ p: ProjectDetail; mode: "rename" | "delete" } | null>(null);
  const [name, setName] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const openEdit = (p: ProjectDetail, mode: "rename" | "delete") => { setName(p.name); setEdit({ p, mode }); setMenu(null); };
  return (
    <>
      <PageHead kicker="Workspace" title="Projects">
        <button onClick={() => setNewOpen(true)} className="gh-btn gh-btn-primary"><Plus className="size-4" /> New project</button>
      </PageHead>
      {!projects.length ? (
        <Empty icon={<FolderGit2 />} title="No projects yet" hint="Describe what you want to build, pick a stack and the eight-agent crew gets to work." action={<button onClick={() => setNewOpen(true)} className="gh-btn gh-btn-primary mt-2">Create your first project</button>} />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const prog = p.tasks.length ? Math.round(p.tasks.reduce((s, t) => s + t.progress, 0) / p.tasks.length) : 0;
            const c = STATUS_COLOR[p.status];
            const active = p.id === project?.id;
            return (
              <article key={p.id} className={cn("gh-glass gh-corners relative flex flex-col rounded-md p-4", active && "ring-1 ring-[var(--acc)]/50")}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase" style={{ color: c }}><Dot color={c} pulse={p.status === "building"} />{p.status}{active && <span className="rounded-sm border border-[var(--acc)]/40 px-1 text-[var(--acc)]">active</span>}</div>
                    <h3 className="mt-1 truncate font-display text-lg font-semibold">{p.name}</h3>
                  </div>
                  <div className="relative">
                    <button onClick={() => setMenu(menu === p.id ? null : p.id)} aria-label={`Actions for ${p.name}`} className="rounded p-1.5 text-muted-foreground hover:bg-white/10"><MoreHorizontal className="size-4" /></button>
                    {menu === p.id && (
                      <div className="absolute right-0 top-8 z-20 w-40 rounded-md border border-[var(--gh-line)] bg-[#0a0d1c] p-1 text-sm shadow-xl">
                        <button onClick={() => openEdit(p, "rename")} className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10"><Pencil className="size-3.5" /> Rename</button>
                        <button onClick={() => { selectProject(p.id); router.push("/dashboard/exports"); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10"><Download className="size-3.5" /> Export</button>
                        <button onClick={() => openEdit(p, "delete")} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-rose-400 hover:bg-rose-500/10"><Trash2 className="size-3.5" /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 min-h-10 text-sm text-muted-foreground">{p.brief}</p>
                <div className="mt-3 flex flex-wrap gap-1">{p.stack.slice(0, 5).map((s) => <span key={s} className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--acc)]">{s}</span>)}{p.stack.length > 5 && <span className="font-mono text-[10px] text-muted-foreground">+{p.stack.length - 5}</span>}</div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="grid flex-1 gap-1.5">
                    <div className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground"><span>{p.tasks.length} tasks / {p.gitlog.length} commits</span><span className="text-foreground">{prog}%</span></div>
                    <Bar value={prog} color={c} />
                  </div>
                  <Sparkline data={sparkline(p.id, 12, 0.7)} color={c} w={64} h={26} />
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {p.agents.map((a) => <span key={a.name} title={`${a.name}: ${a.status}`} className="size-2 rounded-full" style={{ background: a.status === "idle" ? "#334" : agentHex(a.name), opacity: a.status === "done" ? 0.55 : 1 }} />)}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{fmtTime(p.createdAt)}</span>
                </div>
                <button onClick={() => { selectProject(p.id); router.push("/dashboard"); }} className="gh-btn gh-btn-ghost mt-3 !h-8 w-full text-xs">Open mission control</button>
              </article>
            );
          })}
          <button onClick={() => setNewOpen(true)} className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--gh-line)] text-muted-foreground transition-colors hover:border-[var(--acc)]/60 hover:text-foreground">
            <Plus className="size-8" /><span className="text-sm">New project</span>
          </button>
        </div>
      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="sm:max-w-sm">
          {edit && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">{edit.mode === "rename" ? "Rename project" : "Delete project?"}</DialogTitle>
                <DialogDescription>{edit.mode === "rename" ? "Choose a new display name." : `"${edit.p.name}" and its ${edit.p.tasks.length} tasks will be removed from this workspace.`}</DialogDescription>
              </DialogHeader>
              {edit.mode === "rename" && <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Project name" onKeyDown={(e) => { if (e.key === "Enter" && name.trim().length >= 2) { renameProject(edit.p.id, name.trim()); setEdit(null); } }} />}
              <div className="flex justify-end gap-2">
                <button onClick={() => setEdit(null)} className="gh-btn gh-btn-ghost !h-8 text-xs">Cancel</button>
                {edit.mode === "rename" ? (
                  <button disabled={name.trim().length < 2} onClick={() => { renameProject(edit.p.id, name.trim()); setEdit(null); }} className="gh-btn gh-btn-primary !h-8 text-xs">Save</button>
                ) : (
                  <button onClick={() => { deleteProject(edit.p.id); setEdit(null); }} className="gh-btn !h-8 bg-rose-500/80 text-xs text-white hover:bg-rose-500">Delete</button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
