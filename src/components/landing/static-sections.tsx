import Link from "next/link";
import { ArrowRight, Bot, FileText, GitCommit, ListChecks, Play, ShieldCheck, Check } from "lucide-react";
import { Reveal, SectionHead } from "./reveal";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/* ---------- Stack strip (quiet) ---------- */
const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Clerk", "Drizzle ORM", "libSQL", "Zod", "Framer Motion", "Vercel", "Playwright", "Vitest"];

export function StackStrip() {
  return (
    <section aria-label="Technology stack" className="container-page pb-4">
      <Reveal>
        <p className="mb-5 text-center text-[0.8125rem] text-[var(--text-faint)]">Built with, and builds for, the modern TypeScript stack</p>
        <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {STACK.map((s) => (
            <li key={s} className="chip h-7 px-3 text-[0.8125rem]">
              {s}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ---------- Facts ---------- */
const FACTS = [
  ["8", "lead agents", "var(--mint)"],
  ["24", "sub-agents", "var(--blue)"],
  ["13", "API routes", "var(--amber)"],
  ["0", "secrets to run", "var(--coral)"],
] as const;

export function Facts() {
  return (
    <section className="container-page pt-16 sm:pt-20">
      <Reveal>
        <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
          {FACTS.map(([n, l, c]) => (
            <div key={l} className="text-center">
              <dt className="font-display text-[2.5rem] font-semibold leading-none tracking-[-0.04em]" style={{ color: c }}>
                {n}
              </dt>
              <dd className="mt-2 text-sm text-[var(--text-muted)]">{l}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

/* ---------- Bento ---------- */
const ROSTER = [
  ["Backend", "Route /api/invoices", "var(--agent-violet)", "Working"],
  ["Frontend", "Invoice table", "var(--agent-fuchsia)", "Working"],
  ["QA", "Waiting on build", "var(--text-faint)", "Idle"],
  ["Architect", "Blueprint approved", "var(--agent-emerald)", "Done"],
];

const card = "surface card-lift relative flex h-full flex-col p-6 sm:p-7";
const iconWrap = "mb-5 flex size-10 items-center justify-center rounded-[12px]";

export function Bento() {
  return (
    <section className="relative">
      <div className="container-page section">
        <Reveal>
          <SectionHead
            tag="Capabilities"
            title="Everything a build crew needs, in one place."
            sub="Not a chatbot. A pipeline with owners, status, receipts and a gate at the end."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <div className={card}>
              <div className={iconWrap} style={{ background: "var(--mint-tint)", color: "var(--mint)" }}>
                <Bot className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">Live agent roster</h3>
              <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
                See which agent is working, idle or done, and the exact task each one is on right now.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {ROSTER.map(([n, t, c, s]) => (
                  <div key={n} className="flex items-center gap-3 rounded-[12px] bg-black/25 px-3.5 py-3">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: c }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--text)]">{n}</span>
                      <span className="block truncate text-xs text-[var(--text-muted)]">{t}</span>
                    </span>
                    <span className="text-xs text-[var(--text-faint)]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.05}>
            <div className={card}>
              <div className={iconWrap} style={{ background: "var(--blue-tint)", color: "var(--blue)" }}>
                <GitCommit className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">Git-log timeline</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">Every commit with hash, author agent and files touched.</p>
              <ul className="mt-auto space-y-1.5 pt-6 font-mono text-xs text-[var(--text-muted)]">
                {[["a91f3c2", "feat(db)"], ["5be07d1", "feat(ui)"], ["0c44e9a", "test: totals"]].map(([h, m]) => (
                  <li key={h}>
                    <span className="mr-2 text-[var(--blue)]">{h}</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2">
            <div className={card}>
              <div className={iconWrap} style={{ background: "var(--amber-tint)", color: "var(--amber)" }}>
                <ListChecks className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">Task board</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">Work split by module and moved from todo to done.</p>
              <div className="mt-auto space-y-2.5 pt-6">
                {[72, 45, 100].map((p, i) => (
                  <div key={i} className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--amber)] to-[var(--mint)]" style={{ width: `${p}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.05}>
            <div className={card}>
              <div className={iconWrap} style={{ background: "var(--coral-tint)", color: "var(--coral)" }}>
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">Security gate</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">AEGIS audits dependencies, authorisation and leaked secrets before review.</p>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.1}>
            <div className={card}>
              <div className={iconWrap} style={{ background: "rgba(108,182,255,0.13)", color: "var(--agent-sky)" }}>
                <FileText className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">Docs that explain themselves</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">SCRIBE writes the README, guides, API reference and changelog as the code lands.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Flow (5 steps) ---------- */
const STEPS = [
  ["01", "Brief", "Describe your goal in plain words and choose a tech stack.", "You", "var(--mint)"],
  ["02", "Plan", "ATLAS splits the work into modules and tasks and drafts the API contract.", "Architect", "var(--agent-cyan)"],
  ["03", "Build", "FORGE and PRISM commit backend and frontend code in parallel.", "Backend + Frontend", "var(--agent-violet)"],
  ["04", "Verify", "HELM ships a pipeline, ECHO tests, AEGIS audits, SCRIBE documents.", "DevOps, QA, Security, Docs", "var(--amber)"],
  ["05", "Ship", "JUDGE reviews every change and gives a Go / No-Go with required fixes.", "Reviewer", "var(--agent-lime)"],
];

export function Flow() {
  return (
    <section className="relative">
      <div className="container-page section">
        <Reveal>
          <SectionHead tag="How it works" title="From brief to shipped in five stages" sub="Each stage has an owner, an output and a checkpoint, so nothing happens off the record." />
        </Reveal>
        <ol className="relative grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="pointer-events-none absolute left-0 right-0 top-[19px] hidden h-px bg-gradient-to-r from-[var(--mint)]/50 via-[var(--blue)]/30 to-transparent lg:block" />
          {STEPS.map(([n, t, d, who, c], i) => (
            <li key={n}>
              <Reveal delay={i * 0.06}>
                <span
                  className="relative mb-5 flex size-10 items-center justify-center rounded-full bg-[var(--surface-3)] text-sm font-semibold tabular-nums"
                  style={{ color: c, boxShadow: `0 0 0 6px var(--ink), 0 0 0 7px color-mix(in srgb, ${c} 30%, transparent)` }}
                >
                  {n}
                </span>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">{d}</p>
                <p className="mt-3 text-xs font-medium text-[var(--text-faint)]">{who}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal>
          <Link href="/how-it-works" className="btn btn-secondary mt-12">
            Read the full walkthrough <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Demo teaser ---------- */
export function DemoTeaser() {
  return (
    <section className="relative">
      <div className="container-page section">
        <div className="surface-raised relative overflow-hidden rounded-[24px] p-6 sm:p-10 lg:p-12">
          <div className="bg-atmosphere pointer-events-none absolute inset-0 opacity-80" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow mb-4">Demo</p>
              <h2 className="text-balance text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[2.4rem]">Watch a build from first prompt to GO</h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
                A real recorded walkthrough. See ATLAS plan, FORGE and PRISM commit, ECHO test, AEGIS fix a hole and JUDGE sign off.
              </p>
              <ul className="mb-8 mt-6 space-y-2.5 text-sm text-[var(--text-muted)]">
                {["Live agent status changing as work lands", "A git log filling in", "The flow graph lighting up stage by stage"].map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--mint)]" />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href="/demo" className="btn btn-primary btn-lg">
                <Play className="size-4" /> Open the demo
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <Link
                href="/demo"
                aria-label="Watch the demo video"
                className="group relative block aspect-video overflow-hidden rounded-[16px] bg-[var(--surface-1)] shadow-[var(--shadow-2),0_0_0_1px_var(--hairline)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE}/demo/poster.png`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.02]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-[var(--mint)] text-[var(--mint-ink)] shadow-[var(--shadow-mint)] transition-transform duration-200 group-hover:scale-105">
                    <Play className="size-6 fill-current" />
                  </span>
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing teaser ---------- */
const TIERS = [
  { n: "Demo", p: "Free", d: "Explore with sample data. No keys, no card.", f: ["Seeded sample projects", "Full dashboard views", "Local SQLite storage"], href: "/dashboard", cta: "Launch app" },
  { n: "Builder", p: "Pro", d: "For solo founders shipping real products.", f: ["Unlimited projects", "Sub-agent delegation", "Git-log export"], href: "/pricing", cta: "See Pro", hot: true },
  { n: "Crew", p: "Team", d: "Shared workspaces and review policies.", f: ["Roles and permissions", "Custom review gates", "Priority support"], href: "/pricing", cta: "See Team" },
];

export function PricingTeaser() {
  return (
    <section className="relative">
      <div className="container-page section">
        <Reveal>
          <SectionHead tag="Pricing" title="Start free, scale the crew when you need to" sub="Run the whole thing locally with zero secrets, then upgrade when you ship for real." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.06}>
              <div
                className={`card-lift relative flex h-full flex-col p-7 ${t.hot ? "surface-raised" : "surface"}`}
                style={t.hot ? { boxShadow: "var(--inner-top), 0 0 0 1px rgba(62,230,160,0.35), var(--shadow-2), 0 24px 60px -24px rgba(62,230,160,0.3)" } : undefined}
              >
                {t.hot && <span className="chip chip-mint absolute right-6 top-6">Popular</span>}
                <p className="text-sm font-medium text-[var(--text-muted)]">{t.n}</p>
                <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.03em]">{t.p}</p>
                <p className="mt-3 text-[0.9375rem] text-[var(--text-muted)]">{t.d}</p>
                <ul className="my-6 flex-1 space-y-3 text-sm text-[var(--text)]">
                  {t.f.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--mint)]" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className={`btn w-full ${t.hot ? "btn-primary" : "btn-secondary"}`}>
                  {t.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-8 text-sm text-[var(--text-muted)]">
            Compare every plan on the{" "}
            <Link href="/pricing" className="text-[var(--mint)] underline-offset-4 hover:underline">
              pricing page
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQ = [
  ["What exactly do I give Ghost AI?", "A project name, a plain-language brief (a few sentences) and the tech stack you want. That is the whole input. The Architect turns it into modules, tasks and an API contract."],
  ["Do the agents really write code?", "In this build the pipeline, tasks, commits and statuses are simulated against seeded data so you can explore the full workflow safely. The architecture is designed so real model-backed agents can slot into each stage."],
  ["Do I need API keys to try it?", "No. Ghost AI runs locally with SQLite and no secrets. Clerk sign-in is optional; without keys it falls back to demo mode."],
  ["What are sub-agents?", "Each of the eight lead agents has three specialists, for example the Architect's Schema Smith or Security's Secret Sniffer. Leads plan; sub-agents handle focused chores."],
  ["How do I know what changed and why?", "Every commit appears in the git-log timeline with its hash, author agent, message and number of files. Tasks link work to modules, and the Reviewer records a Go / No-Go."],
  ["Where can it be deployed?", "On Vercel for the full stack with libSQL or Turso, and as a static demo on GitHub Pages."],
];

export function Faq() {
  return (
    <section className="relative">
      <div className="container-page section grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHead tag="FAQ" title="Questions, answered" sub="Still stuck? The docs go deeper on every piece." />
          <Link href="/docs" className="btn btn-secondary -mt-6">
            Read the docs <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="space-y-2.5">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="group surface rounded-[14px] transition-colors open:bg-[var(--surface-2)]" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[14px] px-5 py-4 text-[0.9375rem] font-medium text-[var(--text)] transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="text-xl leading-none text-[var(--mint)] transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-atmosphere pointer-events-none absolute inset-0 [transform:scaleY(-1)]" />
      <div className="container-page relative py-28 text-center sm:py-36">
        <Reveal>
          <h2 className="h-display mx-auto max-w-3xl text-[2.4rem] sm:text-6xl">
            Your crew is <span className="text-[var(--mint)]">already online.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
            Create a project in under a minute and watch eight agents get to work.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn btn-primary btn-lg w-full sm:w-auto">
              Launch app <ArrowRight className="size-4" />
            </Link>
            <Link href="/sign-up" className="btn btn-secondary btn-lg w-full sm:w-auto">
              Create an account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
