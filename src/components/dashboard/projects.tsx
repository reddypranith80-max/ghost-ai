"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, FolderGit2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectDetail } from "@/lib/contracts";
import { sparkline } from "@/lib/sim";
import { useDash } from "./store";
import { Bar, Empty, PageHead, Sparkline, agentColor, fmtTime, tint } from "./kit";
import { cn } from "cn";

const STATUS_COLOR = { planning: "var(--blue)", building: "var(--amber)", shipped: "var(--mint)" } as const;
const STATUS_LABEL = { planning: "Planning", building: "Building", shipped: "Shipped" } as const;

export function ProjectsView() {
  const { projects, project, selectProject, setNewOpen, renameProject, deleteProject } = useDash();
  const router = useRouter();
  const [edit, setEdit] = useState<{ p: ProjectDetail; mode: "rename" | "delete" } | null>(null);
  const [name, setName] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[aria-label^=\"Actions for\"]")) setMenu(null); };
    const t = setTimeout(() => window.addEventListener("click", h), 0);
    return () => { clearTimeout(t); window.removeEventListener("click", h); };
  }, [menu]);
  const openEdit = (p: ProjectDetail, mode: "rename" | "delete") => { setName(p.name); setEdit({ p, mode }); setMenu(null); };
  return (
    <>
      <PageHead title="Projects" description="Every build your crew is working on. Pick one to make it the active project.">
        <button onClick={() => setNewOpen(true)} className="btn btn-primary"><Plus className="size-4" /> New project</button>
      </PageHead>
      {!projects.length ? (
        <div className="surface rounded-2xl">
          <Empty icon={<FolderGit2 />} title="No projects yet" hint="Describe what you want to build, pick a stack and the eight-agent crew gets to work." action={<button onClick={() => setNewOpen(true)} className="btn btn-primary">Create your first project</button>} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => {
            const prog = p.tasks.length ? Math.round(p.tasks.reduce((s, t) => s + t.progress, 0) / p.tasks.length) : 0;
            const c = STATUS_COLOR[p.status];
            const active = p.id === project?.id;
            return (
              <article key={p.id} className={cn("surface card-lift reveal relative flex flex-col rounded-2xl p-5", `reveal-${Math.min(8, i + 1)}`, active && "!shadow-[var(--inner-top),0_0_0_1.5px_rgba(62,230,160,0.4),var(--shadow-1)]")}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="chip" style={{ color: c, background: tint(c, 13) }}><span className="size-1.5 rounded-full" style={{ background: c }} />{STATUS_LABEL[p.status]}</span>
                      {active && <span className="text-xs font-medium text-[var(--mint)]">Active</span>}
                    </div>
                    <h3 className="mt-3 truncate font-display text-xl font-semibold tracking-tight">{p.name}</h3>
                  </div>
                  <div className="relative">
                    <button onClick={() => setMenu(menu === p.id ? null : p.id)} aria-label={`Actions for ${p.name}`} className="btn btn-ghost !h-8 !w-8 !px-0"><MoreHorizontal className="size-4" /></button>
                    {menu === p.id && (
                      <div className="absolute right-0 top-9 z-20 w-44 rounded-xl bg-[var(--surface-3)] p-1.5 text-sm shadow-[var(--inner-top),0_0_0_1px_var(--hairline-strong),var(--shadow-2)] animate-in fade-in zoom-in-95 duration-150">
                        <button onClick={() => openEdit(p, "rename")} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.07]"><Pencil className="size-3.5 text-[var(--text-faint)]" /> Rename</button>
                        <button onClick={() => { selectProject(p.id); router.push("/dashboard/exports"); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.07]"><Download className="size-3.5 text-[var(--text-faint)]" /> Export</button>
                        <button onClick={() => openEdit(p, "delete")} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[var(--coral)] transition-colors hover:bg-[var(--coral-tint)]"><Trash2 className="size-3.5" /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-[var(--text-muted)]">{p.brief}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{p.stack.slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}{p.stack.length > 5 && <span className="chip">+{p.stack.length - 5}</span>}</div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div className="grid flex-1 gap-2">
                    <div className="flex justify-between text-xs"><span className="text-[var(--text-faint)]">{p.tasks.length} tasks · {p.gitlog.length} commits</span><span className="font-semibold tabular-nums">{prog}%</span></div>
                    <Bar value={prog} color={c} />
                  </div>
                  <Sparkline data={sparkline(p.id, 12, 0.7)} color={c} w={64} h={28} />
                </div>
                <div className="mt-5 flex items-center gap-1.5">
                  {p.agents.map((a) => <span key={a.name} title={`${a.name}: ${a.status}`} className="size-2 rounded-full" style={{ background: a.status === "idle" ? "rgba(255,255,255,0.14)" : agentColor(a.name), opacity: a.status === "done" ? 0.55 : 1 }} />)}
                  <span className="ml-auto text-xs text-[var(--text-faint)]">{fmtTime(p.createdAt)}</span>
                </div>
                <button onClick={() => { selectProject(p.id); router.push("/dashboard"); }} className="btn btn-secondary btn-sm mt-4 w-full">Open mission control</button>
              </article>
            );
          })}
          <button onClick={() => setNewOpen(true)} className="group flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl text-[var(--text-muted)] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.07)] transition-[background,box-shadow,color] duration-200 hover:bg-white/[0.03] hover:text-foreground hover:shadow-[inset_0_0_0_1.5px_rgba(62,230,160,0.4)]">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/[0.05] transition-colors group-hover:bg-[var(--mint-tint)] group-hover:text-[var(--mint)]"><Plus className="size-5" /></span>
            <span className="text-sm font-medium">New project</span>
          </button>
        </div>
      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="sm:max-w-sm">
          {edit && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{edit.mode === "rename" ? "Rename project" : "Delete project?"}</DialogTitle>
                <DialogDescription>{edit.mode === "rename" ? "Choose a new display name." : `"${edit.p.name}" and its ${edit.p.tasks.length} tasks will be removed from this workspace.`}</DialogDescription>
              </DialogHeader>
              {edit.mode === "rename" && <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Project name" onKeyDown={(e) => { if (e.key === "Enter" && name.trim().length >= 2) { renameProject(edit.p.id, name.trim()); setEdit(null); } }} />}
              <div className="flex justify-end gap-2">
                <button onClick={() => setEdit(null)} className="btn btn-ghost btn-sm">Cancel</button>
                {edit.mode === "rename" ? (
                  <button disabled={name.trim().length < 2} onClick={() => { renameProject(edit.p.id, name.trim()); setEdit(null); }} className="btn btn-primary btn-sm disabled:opacity-50">Save</button>
                ) : (
                  <button onClick={() => { deleteProject(edit.p.id); setEdit(null); }} className="btn btn-sm !bg-[var(--coral)] !text-[#2a0a06] hover:!brightness-110">Delete</button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
