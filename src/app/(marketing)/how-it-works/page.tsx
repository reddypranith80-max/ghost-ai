import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, btnPrimary, btnGhost, textLink } from "@/components/marketing/ui";
import { AGENT_CATALOG } from "@/lib/agent-catalog";

export const metadata: Metadata = { title: "How it works | Ghost AI", description: "From brief to shipped SaaS: the Ghost AI agent pipeline explained step by step." };

const STEPS = [
  { n: "01", t: "You write a brief and pick a stack", d: "Two things go in: a plain-English description of your product and the technologies you like (for example Next.js, Clerk, Drizzle). Ghost AI checks them with a Zod schema so nothing vague slips through.", who: "You", c: "var(--mint)" },
  { n: "02", t: "The Architect makes the plan", d: "ATLAS reads the brief, chooses libraries, draws the database, writes the API contract and splits everything into modules and tasks.", who: "Architect", c: "var(--agent-cyan)" },
  { n: "03", t: "Backend and Frontend build in parallel", d: "FORGE builds APIs and data while PRISM builds pages and components. They work from the same contract, so the pieces fit when they meet.", who: "Backend + Frontend", c: "var(--agent-violet)" },
  { n: "04", t: "DevOps and QA harden the build", d: "HELM sets up CI and containers. ECHO writes tests and tries to break things. Failed tasks go back to the right agent.", who: "DevOps + QA", c: "var(--agent-amber)" },
  { n: "05", t: "Security audits everything", d: "AEGIS scans dependencies, checks permissions, sniffs for leaked secrets and adds security headers.", who: "Security", c: "var(--agent-rose)" },
  { n: "06", t: "The Reviewer says Go or No-Go", d: "JUDGE checks every pull request against a definition of done. If something is missing you get a list of required fixes; otherwise it ships.", who: "Reviewer", c: "var(--agent-lime)" },
];

const TXT = "#eceef2";

function Flow() {
  const nodes = ["Brief", "Architect", "Backend", "Frontend", "DevOps", "QA", "Security", "Reviewer", "Ship"];
  const hue = ["#3ee6a0", "#5ad7e6", "#9d8cff", "#e98af0", "#ffb454", "#3ee6a0", "#ff7a8e", "#b7e65a", "#3ee6a0"];
  const pos: [number, number][] = [[50, 130], [170, 130], [310, 60], [310, 200], [450, 60], [450, 200], [590, 130], [720, 130], [850, 130]];
  const edges: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [2, 5], [3, 4], [4, 6], [5, 6], [6, 7], [7, 8]];
  return (
    <svg viewBox="0 0 920 260" role="img" aria-label="Pipeline diagram: Brief to Architect, fan out to Backend and Frontend, then DevOps and QA, Security, Reviewer, Ship" className="w-full">
      {edges.map(([a, b], i) => (
        <line key={i} x1={pos[a][0] + 38} y1={pos[a][1]} x2={pos[b][0] - 38} y2={pos[b][1]} stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1.5} className="gh-flow" />
      ))}
      {nodes.map((n, i) => (
        <g key={n}>
          <rect x={pos[i][0] - 38} y={pos[i][1] - 18} width={76} height={36} rx={12} fill="#1b1f25" />
          <rect x={pos[i][0] - 38} y={pos[i][1] - 18} width={76} height={36} rx={12} fill={hue[i]} fillOpacity={0.1} />
          <circle cx={pos[i][0] - 26} cy={pos[i][1]} r={3} fill={hue[i]} />
          <text x={pos[i][0] + 4} y={pos[i][1] + 4} textAnchor="middle" fontSize={12} fontWeight={500} fill={TXT}>{n}</text>
        </g>
      ))}
    </svg>
  );
}

function GitSvg() {
  const rows = [["a1f3c9d", "feat(api): projects routes", "Backend", "#9d8cff"], ["b72e0a1", "feat(ui): task board", "Frontend", "#e98af0"], ["c09d4be", "ci: add workflow", "DevOps", "#ffb454"], ["d4417f2", "test(e2e): create project", "QA", "#3ee6a0"]];
  return (
    <svg viewBox="0 0 420 190" className="w-full" role="img" aria-label="Git log timeline with four commits by different agents">
      <line x1={30} y1={20} x2={30} y2={170} stroke="#ffffff" strokeOpacity={0.14} />
      {rows.map((r, i) => (
        <g key={r[0]}>
          <circle cx={30} cy={30 + i * 42} r={5} fill={r[3]} />
          <text x={50} y={26 + i * 42} fontSize={12} fill="#9aa1ad" fontFamily="monospace">{r[0]}</text>
          <text x={120} y={26 + i * 42} fontSize={12} fill={TXT}>{r[1]}</text>
          <text x={50} y={42 + i * 42} fontSize={10} fill="#6b7280">by {r[2]} agent</text>
        </g>
      ))}
    </svg>
  );
}

function TaskSvg() {
  const cols = [["todo", 3, "#6b7280"], ["running", 2, "#ffb454"], ["review", 1, "#7b8cff"], ["done", 4, "#3ee6a0"]] as const;
  return (
    <svg viewBox="0 0 420 190" className="w-full" role="img" aria-label="Task board with four status columns">
      {cols.map(([name, n, c], i) => (
        <g key={name} transform={`translate(${i * 104 + 6},6)`}>
          <text x={0} y={12} fontSize={11} fontWeight={500} fill={c}>{name}</text>
          {Array.from({ length: n }).map((_, k) => (
            <g key={k}>
              <rect x={0} y={22 + k * 40} width={94} height={32} rx={8} fill="#1b1f25" />
              <rect x={8} y={34 + k * 40} width={40 + ((k * 13) % 30)} height={4} rx={2} fill={c} fillOpacity={0.7} />
              <rect x={8} y={42 + k * 40} width={28} height={3} rx={1.5} fill="#ffffff" fillOpacity={0.12} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="How it works" title={<>From one brief to a <span className="gh-text-gradient">shipped SaaS</span></>} lead="Ghost AI is a crew of eight specialised agents with 24 side agents. They plan, build, test, secure and review your product in a visible, trackable pipeline.">
          <Link href="/dashboard" className={btnPrimary}>Try the live dashboard</Link>
          <Link href="/demo" className={btnGhost}>Watch the demo</Link>
        </Hero>

        <Section kicker="The big picture" title="The pipeline at a glance">
          <div className="surface-raised p-4 sm:p-8"><Flow /></div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">Docs runs alongside the whole pipeline, writing guides as modules land. Read the full diagram in <Link className={textLink} href="/docs/architecture">Architecture</Link>.</p>
        </Section>

        <Section kicker="Step by step" title="Six steps, one direction">
          <ol className="relative">
            <span aria-hidden className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent" />
            {STEPS.map((s) => (
              <li key={s.n} className="relative grid grid-cols-[40px_1fr] gap-5 pb-9 last:pb-0 sm:gap-7">
                <span className="relative z-10 grid size-10 place-items-center rounded-full bg-[var(--surface-3)] font-mono text-xs font-semibold shadow-[0_0_0_4px_var(--ink),0_0_0_5px_var(--hairline)]" style={{ color: s.c }}>{s.n}</span>
                <div className="pt-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[var(--text)]">{s.t}</h3>
                    <span className="chip">{s.who}</span>
                  </div>
                  <p className="mt-2 max-w-2xl leading-relaxed text-[var(--text-muted)]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="Vocabulary" title="Tasks, modules and git logs">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="sm:p-8">
              <h3 className="text-lg font-semibold text-[var(--text)]">Tasks and modules</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">A module is a chunk of your product (Auth, Billing, Dashboard). A task is one small job inside a module, owned by exactly one agent, with a status: todo, running, review, done or failed, and a progress number.</p>
              <div className="mt-6 rounded-[12px] bg-black/25 p-3"><TaskSvg /></div>
            </Panel>
            <Panel className="sm:p-8">
              <h3 className="text-lg font-semibold text-[var(--text)]">Git logs</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Every agent commits its work with a hash, a message and a file count. The git-log timeline lets you audit who changed what and when, just like a human team.</p>
              <div className="mt-6 rounded-[12px] bg-black/25 p-3"><GitSvg /></div>
            </Panel>
          </div>
        </Section>

        <Section kicker="Simple words" title="Explain it like I'm five">
          <figure className="surface-raised relative overflow-hidden p-8 sm:p-12">
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-20 h-64 w-80 rounded-full bg-[var(--amber)] opacity-[0.07] blur-[80px]" />
            <blockquote className="relative max-w-3xl font-[family-name:var(--font-display)] text-xl leading-relaxed tracking-[-0.01em] text-[var(--text)] sm:text-2xl">Imagine building a treehouse. One friend draws the plan (Architect). One saws the wood (Backend) while another paints it (Frontend). A friend checks it will not fall (QA), another adds locks (Security), and a teacher says &quot;yes, it is safe&quot; (Reviewer). Ghost AI is all those friends, working at the same time, and you can watch them from a dashboard.</blockquote>
          </figure>
        </Section>

        <Section kicker="Meet the crew" title="Who does what">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AGENT_CATALOG.map((a) => <LinkCard key={a.name} href={`/agents/${a.name.toLowerCase()}`} tag={a.codename} title={a.name} desc={a.tagline} />)}
          </div>
        </Section>

        <Section kicker="Keep going" title="Learn more">
          <div className="grid gap-4 sm:grid-cols-3">
            <LinkCard href="/docs/quick-start" title="Quick start" desc="Run Ghost AI locally in five minutes." />
            <LinkCard href="/docs/architecture" title="Architecture" desc="Layers, data model and the agent pipeline in Mermaid." />
            <LinkCard href="/api-reference" title="API reference" desc="Every endpoint with curl examples you can try." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
