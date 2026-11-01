"use client";

import { useState } from "react";
import { ArrowRight, FileCode2, GitCommit, ListChecks, Network } from "lucide-react";
import { Reveal, SectionHead } from "./reveal";

type Sample = {
  id: string;
  name: string;
  brief: string;
  stack: string[];
  tasks: { t: string; a: string; s: "done" | "running" | "todo"; p: number }[];
  modules: { m: string; files: string[] }[];
  git: { h: string; msg: string; a: string; f: number }[];
  flow: string[];
};

const SAMPLES: Sample[] = [
  {
    id: "invoice",
    name: "Invoice tracker",
    brief: "Freelancers create clients, send invoices, and see who has paid. Email reminders for overdue ones.",
    stack: ["Next.js", "Clerk", "Drizzle", "Tailwind"],
    tasks: [
      { t: "Design invoices + clients schema", a: "Architect", s: "done", p: 100 },
      { t: "POST /api/invoices with Zod validation", a: "Backend", s: "done", p: 100 },
      { t: "Invoice table with status filters", a: "Frontend", s: "running", p: 64 },
      { t: "Overdue reminder cron", a: "DevOps", s: "todo", p: 0 },
    ],
    modules: [
      { m: "billing", files: ["schema.ts", "invoices.ts", "totals.test.ts"] },
      { m: "clients", files: ["clients.ts", "client-card.tsx"] },
      { m: "dashboard", files: ["page.tsx", "revenue-chart.tsx"] },
    ],
    git: [
      { h: "a91f3c2", msg: "feat(db): invoices and clients schema", a: "Backend", f: 4 },
      { h: "5be07d1", msg: "feat(ui): invoice table and filters", a: "Frontend", f: 6 },
      { h: "0c44e9a", msg: "test: totals and tax rounding", a: "QA", f: 2 },
    ],
    flow: ["Architect", "Backend", "Frontend", "QA", "Security", "Reviewer"],
  },
  {
    id: "habit",
    name: "Habit streaks",
    brief: "A daily habit tracker with streaks, reminders and a weekly summary email for each user.",
    stack: ["Next.js", "libSQL", "shadcn/ui", "Framer Motion"],
    tasks: [
      { t: "Model habits, check-ins and streaks", a: "Architect", s: "done", p: 100 },
      { t: "Streak calculation service", a: "Backend", s: "done", p: 100 },
      { t: "Animated streak ring component", a: "Frontend", s: "done", p: 100 },
      { t: "Weekly summary job + docs", a: "Docs", s: "running", p: 40 },
    ],
    modules: [
      { m: "habits", files: ["habits.ts", "streaks.ts", "streaks.test.ts"] },
      { m: "checkins", files: ["checkin-button.tsx", "route.ts"] },
      { m: "summary", files: ["weekly.ts", "email-template.tsx"] },
    ],
    git: [
      { h: "7d2e1b8", msg: "feat(core): streak engine with timezone support", a: "Backend", f: 3 },
      { h: "e3a90f4", msg: "feat(ui): animated streak ring", a: "Frontend", f: 2 },
      { h: "b15c2d7", msg: "docs: how streaks are calculated", a: "Docs", f: 1 },
    ],
    flow: ["Architect", "Backend", "Frontend", "Docs", "QA", "Reviewer"],
  },
  {
    id: "support",
    name: "Support desk",
    brief: "A shared inbox where teams triage tickets, assign owners and track response-time targets.",
    stack: ["Next.js", "Clerk", "Drizzle", "Zod"],
    tasks: [
      { t: "Roles: agent, lead, admin", a: "Security", s: "done", p: 100 },
      { t: "Ticket lifecycle + SLA timers", a: "Backend", s: "running", p: 72 },
      { t: "Kanban triage board", a: "Frontend", s: "running", p: 35 },
      { t: "Playwright: assign + resolve flow", a: "QA", s: "todo", p: 0 },
    ],
    modules: [
      { m: "tickets", files: ["tickets.ts", "sla.ts", "sla.test.ts"] },
      { m: "inbox", files: ["board.tsx", "ticket-card.tsx"] },
      { m: "access", files: ["roles.ts", "guard.ts"] },
    ],
    git: [
      { h: "f08a6c1", msg: "feat(auth): role guard for ticket routes", a: "Security", f: 3 },
      { h: "2b7d9e5", msg: "feat(api): SLA timers and breach flags", a: "Backend", f: 5 },
      { h: "9c31a0d", msg: "feat(ui): triage board columns", a: "Frontend", f: 4 },
    ],
    flow: ["Architect", "Security", "Backend", "Frontend", "QA", "Reviewer"],
  },
];

const TABS = [
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "modules", label: "Modules", icon: FileCode2 },
  { id: "git", label: "Git log", icon: GitCommit },
  { id: "flow", label: "Flow", icon: Network },
] as const;

const STATUS: Record<string, string> = {
  done: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  running: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
  todo: "border-white/15 bg-white/5 text-[#9aa3c7]",
};

export function IoDemo() {
  const [sid, setSid] = useState(SAMPLES[0].id);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("tasks");
  const s = SAMPLES.find((x) => x.id === sid)!;

  return (
    <section className="relative overflow-hidden border-b border-[var(--gh-line)] py-16 sm:py-24">
      <div className="gh-dots absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead
            tag="input → output"
            title={
              <>
                A sentence goes in. <span className="gh-text-gradient">A project comes out.</span>
              </>
            }
            sub="Pick a sample brief and see exactly what Ghost AI hands back: tasks, modules, commits and the agent flow."
          />
        </Reveal>
        <Reveal>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Sample projects">
            {SAMPLES.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={x.id === sid}
                onClick={() => setSid(x.id)}
                className={`border px-3 py-2 font-mono text-xs transition-colors ${
                  x.id === sid
                    ? "border-[var(--gh-cyan)] bg-[var(--gh-cyan)]/10 text-[var(--gh-cyan)]"
                    : "border-[var(--gh-line)] text-[var(--gh-text-dim)] hover:text-white"
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_auto_1.4fr] lg:items-stretch">
            <div className="gh-panel gh-corners relative p-5">
              <p className="gh-hud mb-3">in // brief + stack</p>
              <p className="font-display text-lg leading-snug text-white">{s.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#b8c0e6]">&ldquo;{s.brief}&rdquo;</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.stack.map((t) => (
                  <span key={t} className="border border-[var(--gh-line)] bg-white/[0.04] px-2 py-1 font-mono text-[0.7rem] text-[#c9d1f5]">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 border-t border-dashed border-[var(--gh-line)] pt-4 font-mono text-[0.7rem] text-[var(--gh-text-dim)]">
                $ ghost new &quot;{s.name}&quot; --stack {s.stack.join(",").toLowerCase()}
              </div>
            </div>
            <div className="flex items-center justify-center text-[var(--gh-cyan)]">
              <ArrowRight className="size-6 rotate-90 lg:rotate-0" />
            </div>
            <div className="gh-panel gh-corners relative p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Outputs">
                <span className="gh-hud mr-2">out //</span>
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs transition-colors ${
                      tab === t.id ? "bg-white/10 text-white" : "text-[var(--gh-text-dim)] hover:text-white"
                    }`}
                  >
                    <t.icon className="size-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="min-h-[15rem]">
                {tab === "tasks" && (
                  <ul className="space-y-2.5">
                    {s.tasks.map((t) => (
                      <li key={t.t} className="border border-[var(--gh-line)] bg-black/20 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-white">{t.t}</span>
                          <span className={`border px-2 py-0.5 font-mono text-[0.65rem] uppercase ${STATUS[t.s]}`}>{t.s}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="font-mono text-[0.65rem] text-[var(--gh-cyan)]">{t.a}</span>
                          <div className="h-1 flex-1 bg-white/10">
                            <div className="h-full bg-gradient-to-r from-[var(--gh-cyan)] to-[var(--gh-violet)]" style={{ width: `${t.p}%` }} />
                          </div>
                          <span className="font-mono text-[0.65rem] text-[var(--gh-text-dim)]">{t.p}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "modules" && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {s.modules.map((m) => (
                      <div key={m.m} className="border border-[var(--gh-line)] bg-black/20 p-3">
                        <p className="font-display text-sm font-semibold text-white">/{m.m}</p>
                        <ul className="mt-2 space-y-1 font-mono text-[0.7rem] text-[#9fb0ff]">
                          {m.files.map((f) => (
                            <li key={f} className="break-all">└ {f}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {tab === "git" && (
                  <ul className="space-y-0 border-l border-[var(--gh-line)] pl-4 font-mono text-xs">
                    {s.git.map((g) => (
                      <li key={g.h} className="relative pb-4 last:pb-0">
                        <span className="absolute -left-[1.32rem] top-1 size-2 rounded-full bg-[var(--gh-cyan)] shadow-[0_0_10px_var(--gh-cyan)]" />
                        <p className="text-white">
                          <span className="mr-2 text-[var(--gh-violet)]">{g.h}</span>
                          {g.msg}
                        </p>
                        <p className="mt-0.5 text-[var(--gh-text-dim)]">
                          {g.a} · {g.f} files changed
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "flow" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {s.flow.map((n, i) => (
                      <span key={n} className="flex items-center gap-2">
                        <span className="gh-bevel border border-[var(--gh-cyan)]/50 bg-[var(--gh-cyan)]/10 px-3 py-2 font-mono text-xs text-white">
                          {n}
                        </span>
                        {i < s.flow.length - 1 && <ArrowRight className="size-4 text-[var(--gh-cyan)]" />}
                      </span>
                    ))}
                    <p className="mt-4 w-full text-sm text-[var(--gh-text-dim)]">
                      Agents run in dependency order. The Reviewer only says GO when tests, security and docs checks pass.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
