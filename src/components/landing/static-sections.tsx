import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  FileText,
  GitCommit,
  ListChecks,
  Play,
  ShieldCheck,
  Workflow,
  Check,
  Quote,
} from "lucide-react";
import { Reveal, SectionHead } from "./reveal";

/* ---------- Bento ---------- */
export function Bento() {
  return (
    <section className="relative border-b border-[var(--gh-line)] py-16 sm:py-24">
      <div className="gh-aurora absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead
            tag="capabilities"
            title={
              <>
                Everything a build crew needs, <span className="gh-text-gradient">in one cockpit.</span>
              </>
            }
            sub="Not a chatbot. A pipeline with owners, status, receipts and a gate at the end."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <div className="gh-panel gh-corners relative h-full p-6">
              <Bot className="size-6 text-[var(--gh-cyan)]" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Live agent roster</h3>
              <p className="mt-2 max-w-md text-sm text-[#b8c0e6]">
                See which agent is working, idle or done, and the exact task each one is on right now.
              </p>
              <div className="mt-5 grid gap-2 font-mono text-xs sm:grid-cols-2">
                {[
                  ["FORGE", "working", "Route /api/invoices", "#a06bff"],
                  ["PRISM", "working", "Invoice table", "#e879f9"],
                  ["ECHO", "idle", "Waiting on build", "#8b93b8"],
                  ["ATLAS", "done", "Blueprint approved", "#34d399"],
                ].map(([n, s, t, c]) => (
                  <div key={n} className="flex items-center gap-2 border border-[var(--gh-line)] bg-black/25 px-3 py-2">
                    <span className="size-2 rounded-full" style={{ background: c }} />
                    <span className="text-white">{n}</span>
                    <span className="ml-auto truncate text-[var(--gh-text-dim)]">
                      {s} · {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.06}>
            <div className="gh-panel gh-corners relative h-full p-6">
              <GitCommit className="size-6 text-[var(--gh-violet)]" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Git-log timeline</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">Every commit with hash, author agent and files touched.</p>
              <p className="mt-4 font-mono text-[0.7rem] leading-6 text-[#9fb0ff]">
                a91f3c2 feat(db)
                <br />
                5be07d1 feat(ui)
                <br />
                0c44e9a test: totals
              </p>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2">
            <div className="gh-panel gh-corners relative h-full p-6">
              <ListChecks className="size-6 text-emerald-300" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Task board</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">Work split by module and moved from todo to done.</p>
              <div className="mt-4 space-y-2">
                {[72, 45, 100].map((p, i) => (
                  <div key={i} className="h-1.5 bg-white/10">
                    <div className="h-full bg-gradient-to-r from-emerald-300 to-[var(--gh-cyan)]" style={{ width: `${p}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.06}>
            <div className="gh-panel gh-corners relative h-full p-6">
              <Workflow className="size-6 text-[var(--gh-cyan)]" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Flow graph</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">Architect to Reviewer, drawn as it runs, with flowing data lines.</p>
              <div className="mt-4 flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="size-3 border border-[var(--gh-cyan)] bg-[var(--gh-cyan)]/20" />
                    {i < 4 && <span className="gh-ticks w-4" />}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.12}>
            <div className="gh-panel gh-corners relative h-full p-6">
              <ShieldCheck className="size-6 text-rose-300" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Security gate</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">AEGIS audits dependencies, authorisation and leaked secrets before review.</p>
            </div>
          </Reveal>
          <Reveal className="md:col-span-3">
            <div className="gh-panel gh-corners relative h-full p-6">
              <Boxes className="size-6 text-amber-300" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Bring your own stack</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">
                Pick Next.js, Clerk, Drizzle, Tailwind or your own mix. The Architect&apos;s Stack Scout fits the plan to it.
              </p>
            </div>
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.06}>
            <div className="gh-panel gh-corners relative h-full p-6">
              <FileText className="size-6 text-sky-300" />
              <h3 className="mt-3 font-display text-xl font-bold text-white">Docs that explain themselves</h3>
              <p className="mt-2 text-sm text-[#b8c0e6]">
                SCRIBE writes a README, plain-language guides, an API reference and a changelog as the code lands.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Timeline ---------- */
const STEPS = [
  ["01", "Brief", "Describe your goal in plain words and choose a tech stack.", "You"],
  ["02", "Plan", "ATLAS splits the work into modules and tasks and drafts the API contract.", "Architect"],
  ["03", "Build", "FORGE and PRISM commit backend and frontend code in parallel.", "Backend + Frontend"],
  ["04", "Verify", "HELM ships a pipeline, ECHO tests, AEGIS audits, SCRIBE documents.", "DevOps, QA, Security, Docs"],
  ["05", "Ship", "JUDGE reviews every change and gives a Go / No-Go with required fixes.", "Reviewer"],
];

export function Timeline() {
  return (
    <section className="relative border-b border-[var(--gh-line)] bg-[#070a16] py-16 sm:py-24">
      <div className="gh-dots absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead tag="how it works" title="From brief to shipped in five stages" sub="Each stage has an owner, an output and a checkpoint, so nothing happens off the record." />
        </Reveal>
        <ol className="relative grid gap-4 md:grid-cols-5">
          <div className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-gradient-to-r from-[var(--gh-cyan)] via-[var(--gh-violet)] to-transparent md:block" />
          {STEPS.map(([n, t, d, who], i) => (
            <li key={n}>
              <Reveal delay={i * 0.07}>
                <div className="relative">
                  <span className="relative z-10 mb-4 flex size-9 items-center justify-center border border-[var(--gh-cyan)] bg-[#070a16] font-mono text-xs text-[var(--gh-cyan)] gh-bevel">
                    {n}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">{t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#b8c0e6]">{d}</p>
                  <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-[var(--gh-violet)]">{who}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal>
          <Link href="/how-it-works" className="gh-btn gh-btn-ghost mt-10">
            Read the full walkthrough <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Marquee ---------- */
const STACK = ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "Clerk", "Drizzle ORM", "libSQL", "Zod", "Framer Motion", "TypeScript", "Vercel", "CodeRabbit", "Playwright", "Vitest"];

export function StackMarquee() {
  const row = [...STACK, ...STACK];
  return (
    <section aria-label="Technology stack" className="relative overflow-hidden border-b border-[var(--gh-line)] bg-[#04050b] py-6">
      <p className="gh-hud mb-3 text-center !text-[var(--gh-text-dim)]">built with / works with</p>
      <div className="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <ul className="gh-marquee flex gap-3">
          {row.map((s, i) => (
            <li key={i} className="gh-bevel border border-[var(--gh-line)] bg-white/[0.03] px-5 py-2.5 font-mono text-sm text-[#c9d1f5]">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Use cases ---------- */
const CASES = [
  { who: "Solo founder", what: "Invoice tracker in an afternoon", q: "I wrote two sentences and got a schema, an API, tests and a README. I only had to tweak copy.", m: ["14 tasks", "42 tests", "3 modules"] },
  { who: "Indie hacker", what: "Habit app with streaks", q: "The git log made it easy to trust. I could see which agent changed what and why.", m: ["9 commits", "87% coverage", "0 secrets"] },
  { who: "Small team lead", what: "Internal support desk", q: "AEGIS caught a missing authz check before a human ever looked at the pull request.", m: ["1 finding fixed", "3 roles", "GO verdict"] },
];

export function UseCases() {
  return (
    <section className="relative border-b border-[var(--gh-line)] py-16 sm:py-24">
      <div className="gh-aurora absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead tag="use cases" title="Built for people who ship" sub="Representative scenarios from the demo workspace." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal key={c.who} delay={i * 0.07}>
              <figure className="gh-panel gh-bevel relative flex h-full flex-col p-6">
                <Quote className="size-5 text-[var(--gh-violet)]" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#d5dbf7]">{c.q}</blockquote>
                <figcaption className="mt-5 border-t border-dashed border-[var(--gh-line)] pt-4">
                  <p className="font-display font-semibold text-white">{c.who}</p>
                  <p className="text-xs text-[var(--gh-text-dim)]">{c.what}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.m.map((x) => (
                      <span key={x} className="border border-[var(--gh-cyan)]/30 bg-[var(--gh-cyan)]/5 px-2 py-0.5 font-mono text-[0.65rem] text-[var(--gh-cyan)]">
                        {x}
                      </span>
                    ))}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Demo teaser ---------- */
export function DemoTeaser() {
  return (
    <section className="relative border-b border-[var(--gh-line)] bg-[#070a16] py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <SectionHead
            tag="demo"
            title="Watch a build from first prompt to GO"
            sub="Two minutes, one real brief. See ATLAS plan, FORGE and PRISM commit, ECHO test, AEGIS fix a hole and JUDGE sign off."
          />
          <ul className="mb-6 space-y-2 text-sm text-[#b8c0e6]">
            {["Live agent status changing as work lands", "A real git log filling in", "The flow graph lighting up stage by stage"].map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                {x}
              </li>
            ))}
          </ul>
          <Link href="/demo" className="gh-btn gh-btn-primary gh-btn-lg">
            <Play className="size-4" /> Open the demo
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/demo" aria-label="Open the demo" className="gh-panel gh-corners group relative block aspect-video overflow-hidden">
            <div className="gh-aurora absolute inset-0" />
            <div className="gh-grid absolute inset-0 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full border border-[var(--gh-cyan)] bg-[var(--gh-cyan)]/15 text-[var(--gh-cyan)] shadow-[0_0_40px_-4px_var(--gh-cyan)] transition-transform group-hover:scale-110">
                <Play className="size-6 fill-current" />
              </span>
            </div>
            <span className="gh-hud absolute left-3 top-3 !text-[0.6rem]">rec // 02:04</span>
            <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2 font-mono text-[0.65rem] text-[var(--gh-text-dim)]">
              <span className="h-1 flex-1 bg-white/10">
                <span className="block h-full w-1/3 bg-[var(--gh-cyan)]" />
              </span>
              00:41 / 02:04
            </span>
          </Link>
        </Reveal>
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
    <section className="relative border-b border-[var(--gh-line)] py-16 sm:py-24">
      <div className="gh-dots absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead tag="pricing" title="Start free, scale the crew when you need to" sub="Run the whole thing locally with zero secrets, then upgrade when you ship for real." />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.07}>
              <div
                className={`gh-panel gh-bevel relative flex h-full flex-col p-6 ${t.hot ? "!border-[var(--gh-cyan)] shadow-[0_0_40px_-12px_var(--gh-cyan)]" : ""}`}
              >
                {t.hot && <span className="gh-hud absolute right-5 top-4 !text-[0.6rem]">popular</span>}
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--gh-text-dim)]">{t.n}</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{t.p}</p>
                <p className="mt-2 text-sm text-[#b8c0e6]">{t.d}</p>
                <ul className="my-5 flex-1 space-y-2 text-sm text-[#d5dbf7]">
                  {t.f.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--gh-cyan)]" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className={`gh-btn ${t.hot ? "gh-btn-primary" : "gh-btn-ghost"} w-full`}>
                  {t.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 text-sm text-[var(--gh-text-dim)]">
            Compare every plan on the{" "}
            <Link href="/pricing" className="text-[var(--gh-cyan)] underline-offset-4 hover:underline">
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
    <section className="relative border-b border-[var(--gh-line)] bg-[#070a16] py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHead tag="faq" title="Questions, answered" sub="Still stuck? The docs go deeper on every piece." />
          <Link href="/docs" className="gh-btn gh-btn-ghost">
            Read the docs <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="space-y-2">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="group gh-panel open:border-[var(--gh-cyan)]/50" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-display font-semibold text-white [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="font-mono text-lg text-[var(--gh-cyan)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-[#b8c0e6]">{a}</p>
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
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="gh-aurora absolute inset-0" />
      <div className="gh-grid absolute inset-0 opacity-50" />
      <div className="gh-noise absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="gh-hud mb-4">ready // standing by</p>
          <h2 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Your crew is <span className="gh-text-gradient">already online.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#b8c0e6]">
            Create a project in under a minute and watch eight agents get to work.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="gh-btn gh-btn-primary gh-btn-lg">
              Launch the app <ArrowRight className="size-4" />
            </Link>
            <Link href="/sign-up" className="gh-btn gh-btn-ghost gh-btn-lg">
              Create an account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
