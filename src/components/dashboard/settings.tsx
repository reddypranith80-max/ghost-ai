"use client";

import { useState } from "react";
import { Check, ExternalLink, KeyRound, Palette, PlugZap, RotateCcw, User } from "lucide-react";
import { cn } from "cn";
import { AuthNav } from "@/components/auth/auth-nav";
import { AUTH_ENABLED } from "@/components/auth-provider";
import { probeLive } from "@/lib/client-data";
import { ACCENTS, useDash } from "./store";
import { Dot, PageHead, Panel, field, hud } from "./kit";

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
    { name: "GitHub", desc: "Push generated code, open PRs from agent branches.", status: "Not linked", color: "#8b93b8", docs: "https://docs.github.com/en/apps" },
    { name: "Clerk", desc: "Authentication, orgs and roles for the dashboard.", status: AUTH_ENABLED ? "Connected" : "Demo (no keys)", color: AUTH_ENABLED ? "#34d399" : "#fbbf24", docs: "https://clerk.com/docs" },
    { name: "CodeRabbit", desc: "AI review on every pull request (.coderabbit.yaml).", status: "Configured", color: "#34d399", docs: "https://docs.coderabbit.ai" },
    { name: "Vercel", desc: "Preview and production deploys (vercel.json).", status: "Configured", color: "#34d399", docs: "https://vercel.com/docs" },
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
      <PageHead kicker="Preferences" title="Settings" />
      <div className="grid gap-3.5 lg:grid-cols-2">
        <Panel title="Profile" icon={<User />}>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-[var(--acc)]/50 bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] font-display text-lg text-[var(--acc)]">G</div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{AUTH_ENABLED ? "Signed-in account" : "Demo operator"}</p>
              <p className="text-xs text-muted-foreground">{AUTH_ENABLED ? "Managed by Clerk." : "Auth is off (no Clerk keys or demo build). Data stays in this browser."}</p>
            </div>
            <AuthNav />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["Projects", projects.length], ["Tasks", projects.reduce((s, p) => s + p.tasks.length, 0)], ["Commits", projects.reduce((s, p) => s + p.gitlog.length, 0)]].map(([k, v]) => (
              <div key={k} className="rounded-md border border-[var(--gh-line)] p-2"><dd className="font-display text-xl tabular-nums">{v}</dd><dt className={hud}>{k}</dt></div>
            ))}
          </dl>
        </Panel>

        <Panel title="Theme accent" icon={<Palette />}>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => (
              <button key={a.id} onClick={() => setAccent(a.color)} aria-pressed={accent === a.color} aria-label={`${a.label} accent`}
                className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", accent === a.color ? "border-white/60" : "border-[var(--gh-line)] hover:bg-white/5")}>
                <span className="flex size-4 items-center justify-center rounded-full" style={{ background: a.color, boxShadow: `0 0 12px ${a.color}` }}>{accent === a.color && <Check className="size-3 text-black" />}</span>{a.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Applies to rings, glows, active nav and focus accents. Saved in this browser.</p>
        </Panel>

        <Panel title="API connection" icon={<KeyRound />}>
          <div className="mb-3 flex items-center gap-2 text-sm"><Dot color={source === "live" ? "#34d399" : "#fbbf24"} pulse={source === "live"} /> {source === "live" ? "Using live API" : "Using local demo data (API retried every 20s)"}</div>
          <label className="grid gap-1"><span className={hud}>API base URL</span>
            <input value={base} onChange={(e) => setBase(e.target.value)} placeholder="Same origin (leave empty), or https://api.example.com" className={field} />
          </label>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setApiBase(base); }} className="gh-btn gh-btn-ghost !h-8 text-xs">Save</button>
            <button onClick={() => void test()} disabled={testing} className="gh-btn gh-btn-primary !h-8 text-xs"><PlugZap className="size-3.5" /> {testing ? "Testing..." : "Save and test"}</button>
            <button onClick={resetDemo} className="gh-btn gh-btn-ghost !h-8 text-xs sm:ml-auto"><RotateCcw className="size-3.5" /> Restore demo data</button>
          </div>
        </Panel>

        <Panel title="Keyboard shortcuts">
          <ul className="divide-y divide-[var(--gh-line)]/60">
            {SHORTCUTS.map(([k, d]) => (
              <li key={k} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="text-muted-foreground">{d}</span><kbd className="rounded border border-[var(--gh-line)] bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd></li>
            ))}
          </ul>
        </Panel>

        <Panel title="Connections" icon={<PlugZap />} className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {conns.map((c) => (
              <div key={c.name} className="flex flex-col rounded-md border border-[var(--gh-line)] bg-black/20 p-3">
                <div className="flex items-center justify-between"><h3 className="font-display font-semibold">{c.name}</h3>
                  <span className="flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase" style={{ color: c.color, borderColor: `${c.color}55` }}><Dot color={c.color} />{c.status}</span></div>
                <p className="mt-2 flex-1 text-xs text-muted-foreground">{c.desc}</p>
                <a href={c.docs} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--acc)] hover:underline">Docs <ExternalLink className="size-3" /></a>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
