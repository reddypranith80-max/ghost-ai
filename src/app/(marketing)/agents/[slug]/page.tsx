import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, COLOR, btnGhost } from "@/components/marketing/ui";
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
  const c = COLOR[a.color];
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow={`Agent // ${a.codename}`} title={<>{a.name} <span className={c.text}>agent</span></>} lead={a.tagline}>
          <Link href="/agents" className={btnGhost}>All agents</Link>
          <Link href={`/api-reference#get-api-agents-name`} className={btnGhost}>Agent API</Link>
        </Hero>

        <Section title="At a glance" kicker="Overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><p className="gh-hud">Produces</p><p className="mt-2 text-white">{a.produces}</p></Panel>
            <Panel><p className="gh-hud">Tools</p><div className="mt-2 flex flex-wrap gap-1.5">{a.tools.map((t) => <span key={t} className={`rounded border px-2 py-0.5 text-xs ${c.ring} ${c.bg} ${c.text}`}>{t}</span>)}</div></Panel>
            <Panel><p className="gh-hud">In plain words</p><p className="mt-2 text-sm text-white/90">{x.eli5}</p></Panel>
          </div>
        </Section>

        <Section title="Sub-agents" kicker={`${a.subAgents.length} specialists`}>
          <div className="grid gap-4 md:grid-cols-3">
            {a.subAgents.map((s) => (
              <Panel key={s.id}><h3 className="font-medium text-white">{s.name}</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">{s.role}</p><p className="gh-hud mt-3">{s.id}</p></Panel>
            ))}
          </div>
        </Section>

        <Section title="Typical tasks" kicker="What it picks up">
          <Panel>
            <ul className="grid gap-2 sm:grid-cols-2">
              {x.tasks.map((t) => <li key={t} className="flex items-start gap-2 text-sm text-white/90"><span className={`mt-1.5 size-1.5 rounded-full ${c.bg} ring-1 ring-current ${c.text}`} />{t}</li>)}
            </ul>
          </Panel>
        </Section>

        <Section title="Example output" kicker="What lands in your git log">
          <Code title={`${a.codename.toLowerCase()}.commit`} code={x.example} />
        </Section>

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
