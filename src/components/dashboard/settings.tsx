"use client";

import { useState } from "react";
import { Check, ExternalLink, KeyRound, Palette, PlugZap, RotateCcw, User } from "lucide-react";
import { cn } from "cn";
import { AuthNav } from "@/components/auth/auth-nav";
import { AUTH_ENABLED } from "@/components/auth-provider";
import { probeLive } from "@/lib/client-data";
import { ACCENTS, useDash } from "./store";
import { Dot, PageHead, Panel, field, lbl, tint } from "./kit";

const SHORTCUTS: [string, string][] = [
  ["Ctrl / Cmd + K", "Open command palette"],
  ["Arrow Up / Down", "Move in palette"],
  ["Enter", "Run palette command"],
  ["Esc", "Close dialogs and drawers"],
  ["Tab", "Move between nodes in the Flow graph"],
  ["Enter / Space", "Select a focused Flow node"],
  ["Drag", "Move task cards between Kanban lanes"],
];

export function SettingsView() {
  const { accent, setAccent, apiBase, setApiBase, source, resetDemo, toast, projects } = useDash();
  const [base, setBase] = useState(apiBase);
  const [testing, setTesting] = useState(false);
  const conns = [
    { name: "GitHub", desc: "Push generated code, open PRs from agent branches.", status: "Not linked", color: "var(--text-faint)", docs: "https://docs.github.com/en/apps" },
    { name: "Clerk", desc: "Authentication, orgs and roles for the dashboard.", status: AUTH_ENABLED ? "Connected" : "Demo (no keys)", color: AUTH_ENABLED ? "var(--mint)" : "var(--amber)", docs: "https://clerk.com/docs" },
    { name: "CodeRabbit", desc: "AI review on every pull request (.coderabbit.yaml).", status: "Configured", color: "var(--mint)", docs: "https://docs.coderabbit.ai" },
    { name: "Vercel", desc: "Preview and production deploys (vercel.json).", status: "Configured", color: "var(--mint)", docs: "https://vercel.com/docs" },
  ];
  async function test() {
    setTesting(true);
    setApiBase(base);
    const ok = await probeLive();
    toast({ title: ok ? "API reachable" : "API unreachable", body: ok ? "The dashboard will use live data." : "Staying on local demo data; retrying automatically.", kind: ok ? "ok" : "warn" });
    setTesting(false);
  }
  return (
    <>
      <PageHead title="Settings" description="Your profile, theme, API connection and shortcuts. Everything is saved in this browser." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profile" icon={<User />} className="reveal reveal-1">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--acc)] font-display text-lg font-bold text-[var(--mint-ink)]">G</div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{AUTH_ENABLED ? "Signed-in account" : "Demo operator"}</p>
              <p className="text-[13px] leading-snug text-[var(--text-muted)]">{AUTH_ENABLED ? "Managed by Clerk." : "Auth is off (no Clerk keys or demo build). Data stays in this browser."}</p>
            </div>
            {AUTH_ENABLED && <AuthNav />}
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[["Projects", projects.length], ["Tasks", projects.reduce((s, p) => s + p.tasks.length, 0)], ["Commits", projects.reduce((s, p) => s + p.gitlog.length, 0)]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/[0.035] px-2 py-3.5"><dd className="font-display text-2xl font-semibold tabular-nums">{v}</dd><dt className="mt-0.5 text-xs text-[var(--text-faint)]">{k}</dt></div>
            ))}
          </dl>
        </Panel>

        <Panel title="Theme accent" icon={<Palette />} className="reveal reveal-2">
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => (
              <button key={a.id} onClick={() => setAccent(a.color)} aria-pressed={accent === a.color} aria-label={`${a.label} accent`}
                className={cn("flex h-10 items-center gap-2.5 rounded-xl px-3.5 text-sm font-medium transition-[background,box-shadow,transform] duration-150 active:scale-[0.98]", accent === a.color ? "bg-white/[0.08] shadow-[0_0_0_1.5px_rgba(255,255,255,0.35)]" : "bg-white/[0.035] hover:bg-white/[0.07]")}>
                <span className="flex size-4.5 items-center justify-center rounded-full" style={{ background: a.color, width: 18, height: 18 }}>{accent === a.color && <Check className="size-3 text-black" />}</span>{a.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-faint)]">Tints the active navigation, avatar and highlights. Saved in this browser.</p>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-black/25 p-4" aria-hidden>
            <span className="size-8 rounded-lg" style={{ background: accent }} />
            <span className="h-2 flex-1 rounded-full bg-white/[0.07]"><span className="block h-full w-2/3 rounded-full" style={{ background: accent }} /></span>
            <span className="chip" style={{ color: accent, background: tint(accent, 14) }}>Preview</span>
          </div>
        </Panel>

        <Panel title="API connection" icon={<KeyRound />} className="reveal reveal-3">
          <div className="mb-4 flex items-center gap-2.5 text-sm"><Dot color={source === "live" ? "var(--mint)" : "var(--amber)"} pulse={source === "live"} /> {source === "live" ? "Using live API" : "Using local demo data (API retried every 20s)"}</div>
          <label className="grid gap-1.5"><span className={lbl}>API base URL</span>
            <input value={base} onChange={(e) => setBase(e.target.value)} placeholder="Same origin (leave empty), or https://api.example.com" className={cn(field, "h-10")} />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={() => { setApiBase(base); }} className="btn btn-secondary btn-sm">Save</button>
            <button onClick={() => void test()} disabled={testing} className="btn btn-primary btn-sm disabled:opacity-60"><PlugZap className="size-3.5" /> {testing ? "Testing..." : "Save and test"}</button>
            <button onClick={resetDemo} className="btn btn-ghost btn-sm sm:ml-auto"><RotateCcw className="size-3.5" /> Restore demo data</button>
          </div>
        </Panel>

        <Panel title="Keyboard shortcuts" className="reveal reveal-4">
          <ul className="-my-1">
            {SHORTCUTS.map(([k, d]) => (
              <li key={k} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="text-[var(--text-muted)]">{d}</span><span className="kbd shrink-0">{k}</span></li>
            ))}
          </ul>
        </Panel>

        <Panel title="Connections" icon={<PlugZap />} className="reveal reveal-5 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {conns.map((c) => (
              <div key={c.name} className="card-lift flex flex-col rounded-xl bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-2"><h3 className="font-display text-base font-semibold">{c.name}</h3>
                  <span className="chip" style={{ color: c.color, background: tint(c.color, 13) }}><Dot color={c.color} />{c.status}</span></div>
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-[var(--text-muted)]">{c.desc}</p>
                <a href={c.docs} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--mint)]">Docs <ExternalLink className="size-3" /></a>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
