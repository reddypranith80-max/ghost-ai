import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, LinkCard, CtaBand } from "@/components/marketing/ui";
import { GUIDES } from "@/components/marketing/guides";

export const metadata: Metadata = { title: "Docs | Ghost AI", description: "Guides for Ghost AI: quick start, architecture, agents, API, auth, deploy and troubleshooting." };

export default function DocsHub() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Documentation" title={<>Everything you need to <span className="gh-text-gradient">ship with Ghost AI</span></>} lead="Seven short guides, written in plain language. Start with the quick start, then dig into the parts you care about." />
        <Section title="Guides" kicker="Start here">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g) => <LinkCard key={g.slug} href={g.slug === "api" ? "/api-reference" : `/docs/${g.slug}`} tag={g.time} title={g.title} desc={g.desc} />)}
          </div>
        </Section>
        <Section title="More resources" kicker="Around the site">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LinkCard href="/how-it-works" title="How it works" desc="The pipeline, explained simply." />
            <LinkCard href="/agents" title="Agents" desc="Directory of all eight leads." />
            <LinkCard href="/changelog" title="Changelog" desc="What shipped in v0.1 to v0.3." />
            <LinkCard href="/security" title="Security" desc="How we keep builds safe." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
