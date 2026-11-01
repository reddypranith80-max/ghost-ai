"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Bell, Bot, Check, CheckCheck, CornerDownLeft, Download, FolderGit2, GitBranch, KanbanSquare, LayoutDashboard, Menu, Network, Palette as PaletteIcon,
  Play, Plus, RotateCcw, Search, Settings, X, Info, TriangleAlert,
} from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LogoMark } from "@/components/brand/logo";
import { AuthNav } from "@/components/auth/auth-nav";
import { ACCENTS, DashProvider, useDash } from "./store";
import { NewProjectWizard } from "./new-project-wizard";
import { LogsDrawer } from "./agents";
import { Dot, fmtClock, hud } from "./kit";

export const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/dashboard/git", label: "Git Log", icon: GitBranch },
  { href: "/dashboard/flow", label: "Flow", icon: Network },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SideNav({ onNav }: { onNav?: () => void }) {
  const path = usePathname();
  const { project, projects, selectProject, source, setNewOpen } = useDash();
  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <Link href="/" className="flex items-center gap-2 px-1.5 pt-1" onClick={onNav}>
        <LogoMark size={26} />
        <span className="font-display text-sm font-semibold tracking-[0.2em]">GHOST<span className="text-[var(--acc)]">{"//"}</span>AI</span>
      </Link>
      <button onClick={() => { setNewOpen(true); onNav?.(); }} className="gh-btn gh-btn-primary !h-9 w-full text-xs">
        <Plus className="size-4" /> New project
      </button>
      <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
        {NAV.map((n) => {
          const active = n.href === "/dashboard" ? path === "/dashboard" : path.startsWith(n.href);
          return (
            <Link
              key={n.href} href={n.href} onClick={onNav} aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active ? "bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded bg-[var(--acc)] shadow-[0_0_10px_var(--acc)]" />}
              <n.icon className={cn("size-4", active && "text-[var(--acc)]")} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn(hud, "mb-1.5 px-1.5")}>Active project</div>
        <ul className="flex flex-col gap-1">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => selectProject(p.id)}
                className={cn("flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                  p.id === project?.id ? "border-[var(--acc)]/50 bg-[color-mix(in_srgb,var(--acc)_8%,transparent)]" : "border-transparent text-muted-foreground hover:bg-white/5")}
              >
                <Dot color={p.status === "shipped" ? "#34d399" : p.status === "building" ? "var(--acc)" : "#fbbf24"} pulse={p.status === "building"} />
                <span className="truncate">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="gh-panel rounded-md p-2.5 text-[11px] leading-snug">
        <div className="flex items-center gap-1.5">
          <Dot color={source === "live" ? "#34d399" : source === "demo" ? "#fbbf24" : "#8b93b8"} pulse={source === "live"} />
          <span className="font-mono uppercase tracking-wider">{source === "live" ? "Live API" : source === "demo" ? "Demo data" : "Connecting"}</span>
        </div>
        <p className="mt-1 text-muted-foreground">{source === "demo" ? "Local simulation. Retrying the API every 20s." : source === "live" ? "Backend connected." : "Probing /api/health..."}</p>
      </div>
    </div>
  );
}

function Bell_() {
  const { notes, markAllRead } = useDash();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notes.filter((n) => !n.read).length;
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative flex size-9 items-center justify-center rounded-md border border-[var(--gh-line)] hover:bg-white/5">
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--acc)] font-mono text-[9px] font-bold text-black">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="gh-glass absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-md bg-[#0a0d1c] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--gh-line)] px-3 py-2">
            <span className={hud}>Notifications</span>
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><CheckCheck className="size-3.5" /> Mark read</button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notes.map((n) => (
              <li key={n.id} className="flex gap-2.5 border-b border-[var(--gh-line)]/50 px-3 py-2.5 text-sm last:border-0">
                <span className="mt-0.5">{n.kind === "ok" ? <Check className="size-4 text-emerald-400" /> : n.kind === "warn" ? <TriangleAlert className="size-4 text-amber-400" /> : <Info className="size-4 text-sky-400" />}</span>
                <div className="min-w-0">
                  <p className={cn("leading-snug", n.read && "text-muted-foreground")}>{n.text}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{fmtClock(n.at)} UTC</p>
                </div>
                {!n.read && <span className="ml-auto mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--acc)]" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type Cmd = { id: string; label: string; hint: string; icon: React.ReactNode; run: () => void };

function Palette() {
  const d = useDash();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const cmds = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      ...NAV.map((n) => ({ id: n.href, label: `Go to ${n.label}`, hint: "Navigate", icon: <n.icon className="size-4" />, run: go(n.href) })),
      { id: "run", label: "Run next step", hint: "Action", icon: <Play className="size-4" />, run: () => void d.runNext() },
      { id: "new", label: "New project", hint: "Action", icon: <Plus className="size-4" />, run: () => d.setNewOpen(true) },
      { id: "export", label: "Export current project", hint: "Action", icon: <Download className="size-4" />, run: go("/dashboard/exports") },
      { id: "read", label: "Mark notifications as read", hint: "Action", icon: <CheckCheck className="size-4" />, run: d.markAllRead },
      { id: "reset", label: "Restore demo data", hint: "Action", icon: <RotateCcw className="size-4" />, run: d.resetDemo },
      ...d.projects.map((p) => ({ id: `p-${p.id}`, label: `Switch to ${p.name}`, hint: "Project", icon: <FolderGit2 className="size-4" />, run: () => d.selectProject(p.id) })),
      ...ACCENTS.map((a) => ({ id: `a-${a.id}`, label: `Accent: ${a.label}`, hint: "Theme", icon: <PaletteIcon className="size-4" style={{ color: a.color }} />, run: () => d.setAccent(a.color) })),
    ];
  }, [d, router]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? cmds.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(s)) : cmds;
  }, [q, cmds]);
  const sel = Math.min(idx, Math.max(0, list.length - 1));
  const exec = (c?: Cmd) => { if (!c) return; d.setPaletteOpen(false); setQ(""); setIdx(0); c.run(); };
  return (
    <Dialog open={d.paletteOpen} onOpenChange={(o) => { d.setPaletteOpen(o); if (!o) { setQ(""); setIdx(0); } }}>
      <DialogContent className="top-[20%] gap-0 overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-[var(--gh-line)] px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} placeholder="Type a command or search..."
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx(Math.min(sel + 1, list.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(Math.max(sel - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); exec(list[sel]); }
            }}
          />
          <kbd className="rounded border border-[var(--gh-line)] px-1.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {list.map((c, i) => (
            <li key={c.id}>
              <button
                onClick={() => exec(c)} onMouseMove={() => setIdx(i)}
                className={cn("flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm", i === sel ? "bg-[color-mix(in_srgb,var(--acc)_16%,transparent)]" : "")}
              >
                <span className="text-[var(--acc)]">{c.icon}</span>
                <span className="flex-1 truncate">{c.label}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{c.hint}</span>
                {i === sel && <CornerDownLeft className="size-3.5 text-muted-foreground" />}
              </button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for &quot;{q}&quot;.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useDash();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="gh-glass pointer-events-auto animate-in slide-in-from-right-8 fade-in rounded-md bg-[#0a0d1c]/95 p-3 shadow-2xl duration-200"
          style={{ borderLeft: `3px solid ${t.kind === "ok" ? "#34d399" : t.kind === "warn" ? "#fbbf24" : "var(--acc)"}` }}>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs text-muted-foreground">{t.body}</p>}
              {t.files && (
                <ul className="mt-1.5 max-h-28 overflow-y-auto font-mono text-[11px] text-muted-foreground">
                  {t.files.map((f) => <li key={f} className="truncate"><Check className="mr-1 inline size-3 text-emerald-400" />{f}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const d = useDash();
  const [drawer, setDrawer] = useState(false);
  const style = { "--acc": d.accent } as CSSProperties;
  useEffect(() => {
    document.documentElement.style.setProperty("--acc", d.accent);
  }, [d.accent]);
  return (
    <div style={style} className="relative flex min-h-screen w-full max-w-full overflow-x-clip text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[var(--gh-line)] bg-[#070a18]/80 backdrop-blur md:block">
        <SideNav />
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[85vw] border-r border-[var(--gh-line)] bg-[#070a18] animate-in slide-in-from-left duration-200">
            <SideNav onNav={() => setDrawer(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[var(--gh-line)] bg-[#05060d]/80 px-3 py-2 backdrop-blur sm:px-5">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex size-9 items-center justify-center rounded-md border border-[var(--gh-line)] md:hidden"><Menu className="size-4" /></button>
          <button
            onClick={() => d.setPaletteOpen(true)}
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-[var(--gh-line)] bg-white/[0.03] px-3 text-left text-sm text-muted-foreground hover:bg-white/[0.06] sm:max-w-md"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search or run a command...</span>
            <kbd className="ml-auto hidden rounded border border-[var(--gh-line)] px-1.5 font-mono text-[10px] sm:block">Ctrl K</kbd>
          </button>
          <div className="hidden sm:block">
            <button onClick={() => void d.runNext()} disabled={d.running || !d.project} className="gh-btn gh-btn-ghost !h-9 !px-3 text-xs">
              <Play className="size-3.5" /> {d.running ? "Running..." : "Run next step"}
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Bell_ />
            <div className="hidden sm:block"><AuthNav /></div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6">{children}</main>
      </div>
      <Palette />
      <NewProjectWizard />
      <LogsDrawer />
      <Toasts />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashProvider>
      <Frame>{children}</Frame>
    </DashProvider>
  );
}
