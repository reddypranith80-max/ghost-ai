import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, Eye, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, LinkCard, CtaBand, Feature, btnGhost } from "@/components/marketing/ui";
import { AgentDirectory } from "@/components/marketing/agent-directory";
import { AGENT_CATALOG } from "@/lib/agent-catalog";

export const metadata: Metadata = { title: "Agents | Ghost AI", description: "Meet the eight lead agents and 24 side agents that build your SaaS." };

export default function AgentsPage() {
  const subs = AGENT_CATALOG.reduce((n, a) => n + a.subAgents.length, 0);
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="The crew" title={<>Eight leads. <span className="gh-text-gradient">{subs} side agents.</span></>} lead="Each lead agent owns one discipline and delegates narrow jobs to its sub-agents. Search the directory, expand a card, or open an agent for example output.">
          <Link href="/how-it-works" className={btnGhost}>See how they work together</Link>
        </Hero>
        <Section title="Agent directory" kicker="Filter and explore"><AgentDirectory /></Section>
        <Section title="How the crew collaborates" kicker="Hand-offs">
          <div className="grid gap-10 md:grid-cols-3">
            <Feature icon={FileCheck2} tone="mint" title="Shared contracts">Every agent reads the same Zod contracts and OpenAPI file, so the API Backend writes is the API Frontend calls.</Feature>
            <Feature icon={Eye} tone="blue" title="Visible work">Agents publish status (idle, working, done), tasks and commits that the dashboard streams in real time.</Feature>
            <Feature icon={ShieldCheck} tone="amber" title="Gated shipping">Security and Reviewer sit at the end of the line. Nothing ships without a Go.</Feature>
          </div>
        </Section>
        <Section title="Keep exploring" kicker="Next">
          <div className="grid gap-4 sm:grid-cols-3">
            <LinkCard href="/api-reference" title="Agents API" desc="GET /api/agents and GET /api/agents/:name return live agent state." />
            <LinkCard href="/docs/agents" title="Agents guide" desc="How agents are defined, extended and scheduled." />
            <LinkCard href="/pricing" title="Pricing" desc="Compare Hobby, Pro and Team (demo pricing)." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
