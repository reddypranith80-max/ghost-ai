import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, ACCENT, accentStyle, btnGhost } from "@/components/marketing/ui";
import { Code } from "@/components/marketing/copy-button";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { AGENT_EXTRAS } from "@/components/marketing/agent-extras";

export function generateStaticParams() {
  return AGENT_CATALOG.map((a) => ({ slug: a.name.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AGENT_CATALOG.find((x) => x.name.toLowerCase() === slug);
  return a ? { title: `${a.name} agent (${a.codename}) | Ghost AI`, description: a.tagline } : {};
}

export default async function AgentDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = AGENT_CATALOG.find((x) => x.name.toLowerCase() === slug);
  if (!a) notFound();
  const x = AGENT_EXTRAS[a.name];
  return (
    <SiteShell>
      <Page>
        <Hero accent={a.color} eyebrow={`Agent · ${a.codename}`} title={<>{a.name} <span className={ACCENT.text}>agent</span></>} lead={a.tagline}>
          <Link href="/agents" className={btnGhost}>All agents</Link>
          <Link href="/api-reference#get-api-agents-name" className={btnGhost}>Agent API</Link>
        </Hero>

        <div style={accentStyle(a.color)}>
          <Section title="At a glance" kicker="Overview">
            <div className="grid gap-4 md:grid-cols-3">
              <Panel><p className="text-sm font-medium text-[var(--text-faint)]">Produces</p><p className="mt-3 text-lg font-medium leading-snug text-[var(--text)]">{a.produces}</p></Panel>
              <Panel><p className="text-sm font-medium text-[var(--text-faint)]">Tools</p><div className="mt-3 flex flex-wrap gap-1.5">{a.tools.map((t) => <span key={t} className={`chip ${ACCENT.chip}`}>{t}</span>)}</div></Panel>
              <Panel><p className="text-sm font-medium text-[var(--text-faint)]">In plain words</p><p className="mt-3 text-[var(--text)]">{x.eli5}</p></Panel>
            </div>
          </Section>

          <Section title="Sub-agents" kicker={`${a.subAgents.length} specialists`}>
            <div className="grid gap-4 md:grid-cols-3">
              {a.subAgents.map((s) => (
                <Panel key={s.id}>
                  <span className={`block h-1 w-8 rounded-full ${ACCENT.dot}`} />
                  <h3 className="mt-4 font-semibold text-[var(--text)]">{s.name}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{s.role}</p>
                </Panel>
              ))}
            </div>
          </Section>

          <Section title="Typical tasks" kicker="What it picks up">
            <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {x.tasks.map((t) => <li key={t} className="flex items-start gap-3 text-[var(--text)]"><span className={`mt-2 size-1.5 shrink-0 rounded-full ${ACCENT.dot}`} />{t}</li>)}
            </ul>
          </Section>

          <Section title="Example output" kicker="What lands in your git log">
            <Code title={`${a.codename.toLowerCase()}.commit`} code={x.example} />
          </Section>
        </div>

        <Section title="Works closely with" kicker="Related agents">
          <div className="grid gap-4 sm:grid-cols-3">
            {x.related.map((r) => {
              const rs = AGENT_CATALOG.find((y) => y.name === r)!;
              return <LinkCard key={r} href={`/agents/${r.toLowerCase()}`} tag={rs.codename} title={r} desc={rs.tagline} />;
            })}
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
