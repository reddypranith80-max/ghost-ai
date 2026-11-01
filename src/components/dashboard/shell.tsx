"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Bell, Bot, Check, CheckCheck, CornerDownLeft, Download, FolderGit2, GitBranch, KanbanSquare, LayoutDashboard, Menu, Network, Palette as PaletteIcon,
  Play, Plus, RotateCcw, Search, Settings, X, Info, TriangleAlert, MoreHorizontal,
} from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LogoMark } from "@/components/brand/logo";
import { AuthNav } from "@/components/auth/auth-nav";
import { AUTH_ENABLED } from "@/components/auth-provider";
import { ACCENTS, DashProvider, useDash } from "./store";
import { NewProjectWizard } from "./new-project-wizard";
import { LogsDrawer } from "./agents";
import { Dot, fmtClock, tint } from "./kit";

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

const isActive = (path: string, href: string) => (href === "/dashboard" ? path === "/dashboard" : path.startsWith(href));
const PROJECT_COLOR = { shipped: "var(--mint)", building: "var(--amber)", planning: "var(--blue)" } as const;

function SideNav({ onNav }: { onNav?: () => void }) {
  const path = usePathname();
  const { project, projects, selectProject, source, setNewOpen } = useDash();
  return (
    <div className="flex h-full flex-col gap-5 px-3 pb-3 pt-4">
      <Link href="/" className="flex items-center gap-2.5 rounded-xl px-2 py-1 transition-opacity hover:opacity-80" onClick={onNav}>
        <LogoMark size={28} />
        <span className="font-display text-[17px] font-bold tracking-[-0.03em]">Ghost<span className="text-[var(--mint)]">.AI</span></span>
      </Link>

      <button onClick={() => { setNewOpen(true); onNav?.(); }} className="btn btn-secondary btn-sm !h-9 w-full !justify-start !px-3">
        <Plus className="size-4 text-[var(--mint)]" /> New project
      </button>

      <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
        {NAV.map((n) => {
          const active = isActive(path, n.href);
          return (
            <Link
              key={n.href} href={n.href} onClick={onNav} aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] font-medium transition-[background,color] duration-150",
                active ? "bg-white/[0.08] text-foreground" : "text-[var(--text-muted)] hover:bg-white/[0.045] hover:text-foreground",
              )}
            >
              <n.icon className={cn("size-[17px] transition-colors", active ? "text-[var(--acc)]" : "text-[var(--text-faint)] group-hover:text-[var(--text-muted)]")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1.5 px-2.5 text-xs font-medium text-[var(--text-faint)]">Workspace</div>
        <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { selectProject(p.id); onNav?.(); }}
                aria-current={p.id === project?.id ? "true" : undefined}
                className={cn("flex h-8 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] transition-colors duration-150",
                  p.id === project?.id ? "bg-white/[0.06] font-medium text-foreground" : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-foreground")}
              >
                <Dot color={PROJECT_COLOR[p.status]} pulse={p.status === "building"} />
                <span className="truncate">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white/[0.035] p-3">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <Dot color={source === "live" ? "var(--mint)" : source === "demo" ? "var(--amber)" : "var(--text-faint)"} pulse={source === "live"} />
          {source === "live" ? "Live API" : source === "demo" ? "Demo data" : "Connecting"}
        </div>
        <p className="mt-1 text-xs leading-snug text-[var(--text-faint)]">{source === "demo" ? "Local simulation. Retrying the API every 20s." : source === "live" ? "Backend connected." : "Probing /api/health..."}</p>
      </div>
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex size-8 items-center justify-center rounded-full bg-[var(--acc)] font-display text-sm font-bold text-[var(--mint-ink)]">G</div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-medium">{AUTH_ENABLED ? "Signed in" : "Demo operator"}</p>
          <p className="truncate text-xs text-[var(--text-faint)]">{AUTH_ENABLED ? "Clerk account" : "Data stays in this browser"}</p>
        </div>
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
  const kindColor = { ok: "var(--mint)", warn: "var(--amber)", info: "var(--blue)" } as const;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open} className="btn btn-ghost !h-9 !w-9 !px-0">
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--acc)] text-[9px] font-bold text-[var(--mint-ink)]">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] origin-top-right rounded-2xl bg-[var(--surface-2)] shadow-[var(--inner-top),0_0_0_1px_var(--hairline-strong),var(--shadow-2)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
            <span className="font-display text-[15px] font-semibold">Notifications</span>
            <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-foreground"><CheckCheck className="size-3.5" /> Mark read</button>
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {notes.map((n) => (
              <li key={n.id} className="flex gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors hover:bg-white/[0.04]">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: tint(kindColor[n.kind], 14), color: kindColor[n.kind] }}>
                  {n.kind === "ok" ? <Check className="size-3.5" /> : n.kind === "warn" ? <TriangleAlert className="size-3.5" /> : <Info className="size-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className={cn("leading-snug", n.read && "text-[var(--text-muted)]")}>{n.text}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-faint)]">{fmtClock(n.at)} UTC</p>
                </div>
                {!n.read && <span className="ml-auto mt-2 size-1.5 shrink-0 rounded-full bg-[var(--acc)]" />}
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
      <DialogContent className="top-[18%] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-3 px-4 shadow-[0_1px_0_var(--hairline)]">
          <Search className="size-[18px] text-[var(--text-faint)]" />
          <input
            autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} placeholder="Type a command or search..."
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--text-faint)]"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx(Math.min(sel + 1, list.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(Math.max(sel - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); exec(list[sel]); }
            }}
          />
          <span className="kbd">Esc</span>
        </div>
        <ul className="max-h-[22rem] overflow-y-auto p-2">
          {list.map((c, i) => (
            <li key={c.id}>
              <button
                onClick={() => exec(c)} onMouseMove={() => setIdx(i)}
                className={cn("flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors duration-100", i === sel ? "bg-white/[0.07]" : "")}
              >
                <span className={cn("transition-colors", i === sel ? "text-[var(--acc)]" : "text-[var(--text-faint)]")}>{c.icon}</span>
                <span className="flex-1 truncate font-medium">{c.label}</span>
                <span className="text-xs text-[var(--text-faint)]">{c.hint}</span>
                {i === sel && <CornerDownLeft className="size-3.5 text-[var(--text-faint)]" />}
              </button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-10 text-center text-sm text-[var(--text-muted)]">No matches for &quot;{q}&quot;.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useDash();
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2.5 md:bottom-5 md:right-5" aria-live="polite">
      {toasts.map((t) => {
        const c = t.kind === "ok" ? "var(--mint)" : t.kind === "warn" ? "var(--amber)" : "var(--blue)";
        return (
          <div key={t.id} className="pointer-events-auto rounded-2xl bg-[var(--surface-2)] p-4 shadow-[var(--inner-top),0_0_0_1px_var(--hairline-strong),var(--shadow-2)] animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: tint(c, 15), color: c }}>
                {t.kind === "ok" ? <Check className="size-3.5" /> : t.kind === "warn" ? <TriangleAlert className="size-3.5" /> : <Info className="size-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{t.body}</p>}
                {t.files && (
                  <ul className="mt-2 max-h-28 overflow-y-auto rounded-lg bg-black/30 px-2.5 py-2 font-mono text-[11px] text-[var(--text-muted)]">
                    {t.files.map((f) => <li key={f} className="truncate"><Check className="mr-1.5 inline size-3 text-[var(--mint)]" />{f}</li>)}
                  </ul>
                )}
              </div>
              <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:bg-white/[0.06] hover:text-foreground"><X className="size-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TAB_NAV = ["/dashboard", "/dashboard/projects", "/dashboard/tasks", "/dashboard/agents"];

function BottomNav({ onMore }: { onMore: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around bg-[var(--surface-1)]/90 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-1px_0_var(--hairline)] backdrop-blur-xl md:hidden">
      {NAV.filter((n) => TAB_NAV.includes(n.href)).map((n) => {
        const active = isActive(path, n.href);
        return (
          <Link key={n.href} href={n.href} className={cn("flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors", active ? "text-foreground" : "text-[var(--text-faint)]")}>
            <n.icon className={cn("size-5", active && "text-[var(--acc)]")} />
            {n.label}
          </Link>
        );
      })}
      <button onClick={onMore} className="flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-[var(--text-faint)]">
        <MoreHorizontal className="size-5" /> More
      </button>
    </nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const d = useDash();
  const [drawer, setDrawer] = useState(false);
  const path = usePathname();
  const style = { "--acc": d.accent } as CSSProperties;
  useEffect(() => {
    document.documentElement.style.setProperty("--acc", d.accent);
  }, [d.accent]);
  return (
    <div style={style} className="relative flex min-h-screen w-full max-w-full overflow-x-clip text-foreground">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 bg-[var(--surface-1)]/80 shadow-[1px_0_0_var(--hairline)] backdrop-blur-xl md:block">
        <SideNav />
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--surface-1)] shadow-[var(--shadow-2)] animate-in slide-in-from-left duration-200">
            <SideNav onNav={() => setDrawer(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2.5 bg-[var(--ink)]/70 px-4 backdrop-blur-xl sm:px-8">
          <div className="md:hidden"><button onClick={() => setDrawer(true)} aria-label="Open menu" className="btn btn-ghost !h-9 !w-9 !px-0"><Menu className="size-[18px]" /></button></div>
          <button
            onClick={() => d.setPaletteOpen(true)}
            className="surface-inset group flex h-10 min-w-0 flex-1 items-center gap-2.5 px-3.5 text-left text-sm text-[var(--text-faint)] transition-colors duration-150 hover:text-[var(--text-muted)] sm:max-w-md sm:flex-none sm:basis-96"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search or run a command...</span>
            <span className="ml-auto hidden sm:block"><span className="kbd">Ctrl K</span></span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className={cn("hidden", path !== "/dashboard" && "sm:block")}>
              <button onClick={() => void d.runNext()} disabled={d.running || !d.project} className="btn btn-secondary btn-sm disabled:opacity-60">
                <Play className="size-3.5 text-[var(--mint)]" /> {d.running ? "Running..." : "Run next step"}
              </button>
            </div>
            <Bell_ />
            <div className="hidden sm:block">{AUTH_ENABLED ? <AuthNav /> : <span className="chip chip-blue">Demo mode</span>}</div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-8 md:pb-14">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
      <BottomNav onMore={() => setDrawer(true)} />
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
