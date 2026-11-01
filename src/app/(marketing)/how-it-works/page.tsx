import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, btnPrimary, btnGhost } from "@/components/marketing/ui";
import { AGENT_CATALOG } from "@/lib/agent-catalog";

export const metadata: Metadata = { title: "How it works | Ghost AI", description: "From brief to shipped SaaS: the Ghost AI agent pipeline explained step by step." };

const STEPS = [
  { n: "01", t: "You write a brief and pick a stack", d: "Two things go in: a plain-English description of your product and the technologies you like (for example Next.js, Clerk, Drizzle). Ghost AI checks them with a Zod schema so nothing vague slips through.", who: "You" },
  { n: "02", t: "The Architect makes the plan", d: "ATLAS reads the brief, chooses libraries, draws the database, writes the API contract and splits everything into modules and tasks.", who: "Architect" },
  { n: "03", t: "Backend and Frontend build in parallel", d: "FORGE builds APIs and data while PRISM builds pages and components. They work from the same contract, so the pieces fit when they meet.", who: "Backend + Frontend" },
  { n: "04", t: "DevOps and QA harden the build", d: "HELM sets up CI and containers. ECHO writes tests and tries to break things. Failed tasks go back to the right agent.", who: "DevOps + QA" },
  { n: "05", t: "Security audits everything", d: "AEGIS scans dependencies, checks permissions, sniffs for leaked secrets and adds security headers.", who: "Security" },
  { n: "06", t: "The Reviewer says Go or No-Go", d: "JUDGE checks every pull request against a definition of done. If something is missing you get a list of required fixes; otherwise it ships.", who: "Reviewer" },
];

function Flow() {
  const nodes = ["Brief", "Architect", "Backend", "Frontend", "DevOps", "QA", "Security", "Reviewer", "Ship"];
  const pos: [number, number][] = [[50, 130], [170, 130], [310, 60], [310, 200], [450, 60], [450, 200], [590, 130], [720, 130], [850, 130]];
  const edges: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [2, 5], [3, 4], [4, 6], [5, 6], [6, 7], [7, 8]];
  return (
    <svg viewBox="0 0 920 260" role="img" aria-label="Pipeline diagram: Brief to Architect, fan out to Backend and Frontend, then DevOps and QA, Security, Reviewer, Ship" className="w-full">
      {edges.map(([a, b], i) => (
        <line key={i} x1={pos[a][0] + 38} y1={pos[a][1]} x2={pos[b][0] - 38} y2={pos[b][1]} stroke="#22e5ff" strokeOpacity={0.6} strokeWidth={1.5} className="gh-flow" />
      ))}
      {nodes.map((n, i) => (
        <g key={n}>
          <rect x={pos[i][0] - 38} y={pos[i][1] - 18} width={76} height={36} rx={6} fill="#0e1224" stroke={i === 8 ? "#a06bff" : "#22e5ff"} strokeOpacity={0.7} />
          <text x={pos[i][0]} y={pos[i][1] + 4} textAnchor="middle" fontSize={12} fill="#e8ecff">{n}</text>
        </g>
      ))}
    </svg>
  );
}

function GitSvg() {
  const rows = [["a1f3c9d", "feat(api): projects routes", "Backend"], ["b72e0a1", "feat(ui): task board", "Frontend"], ["c09d4be", "ci: add workflow", "DevOps"], ["d4417f2", "test(e2e): create project", "QA"]];
  return (
    <svg viewBox="0 0 420 190" className="w-full" role="img" aria-label="Git log timeline with four commits by different agents">
      <line x1={30} y1={20} x2={30} y2={170} stroke="#22e5ff" strokeOpacity={0.5} />
      {rows.map((r, i) => (
        <g key={r[0]}>
          <circle cx={30} cy={30 + i * 42} r={6} fill="#a06bff" />
          <text x={50} y={26 + i * 42} fontSize={12} fill="#22e5ff" fontFamily="monospace">{r[0]}</text>
          <text x={120} y={26 + i * 42} fontSize={12} fill="#e8ecff">{r[1]}</text>
          <text x={50} y={42 + i * 42} fontSize={10} fill="#8b93b8">by {r[2]} agent</text>
        </g>
      ))}
    </svg>
  );
}

function TaskSvg() {
  const cols = [["todo", 3], ["running", 2], ["review", 1], ["done", 4]] as const;
  return (
    <svg viewBox="0 0 420 190" className="w-full" role="img" aria-label="Task board with four status columns">
      {cols.map(([name, n], i) => (
        <g key={name} transform={`translate(${i * 104 + 6},6)`}>
          <text x={0} y={12} fontSize={11} fill="#22e5ff" fontFamily="monospace">{name.toUpperCase()}</text>
          {Array.from({ length: n }).map((_, k) => (
            <rect key={k} x={0} y={22 + k * 40} width={94} height={32} rx={5} fill="#0e1224" stroke="#78a0ff" strokeOpacity={0.35} />
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
          <Panel><Flow /></Panel>
          <p className="mt-3 text-sm text-[var(--gh-text-dim)]">Docs runs alongside the whole pipeline, writing guides as modules land. Read the full diagram in <Link className="text-cyan-300 underline" href="/docs/architecture">Architecture</Link>.</p>
        </Section>

        <Section kicker="Step by step" title="Six steps, one direction">
          <ol className="grid gap-4 md:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n}>
                <Panel className="h-full">
                  <div className="flex items-baseline justify-between"><span className="gh-hud">Step {s.n}</span><span className="text-xs text-[var(--gh-text-dim)]">{s.who}</span></div>
                  <h3 className="mt-2 font-medium text-white">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--gh-text-dim)]">{s.d}</p>
                </Panel>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="Vocabulary" title="Tasks, modules and git logs">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel>
              <h3 className="font-medium text-white">Tasks and modules</h3>
              <p className="mt-2 text-sm text-[var(--gh-text-dim)]">A module is a chunk of your product (Auth, Billing, Dashboard). A task is one small job inside a module, owned by exactly one agent, with a status: todo, running, review, done or failed, and a progress number.</p>
              <div className="mt-3"><TaskSvg /></div>
            </Panel>
            <Panel>
              <h3 className="font-medium text-white">Git logs</h3>
              <p className="mt-2 text-sm text-[var(--gh-text-dim)]">Every agent commits its work with a hash, a message and a file count. The git-log timeline lets you audit who changed what and when, just like a human team.</p>
              <div className="mt-3"><GitSvg /></div>
            </Panel>
          </div>
        </Section>

        <Section kicker="Simple words" title="Explain it like I'm five">
          <Panel className="border-cyan-400/30">
            <p className="text-base leading-relaxed text-white/90">Imagine building a treehouse. One friend draws the plan (Architect). One saws the wood (Backend) while another paints it (Frontend). A friend checks it will not fall (QA), another adds locks (Security), and a teacher says &quot;yes, it is safe&quot; (Reviewer). Ghost AI is all those friends, working at the same time, and you can watch them from a dashboard.</p>
          </Panel>
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
