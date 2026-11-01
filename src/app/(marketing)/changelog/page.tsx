import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand } from "@/components/marketing/ui";

export const metadata: Metadata = { title: "Changelog | Ghost AI", description: "Release notes for Ghost AI v0.1 to v0.3." };

const RELEASES = [
  { v: "v0.3", date: "2026-10-28", title: "Marketing site and API explorer", items: ["New pages: How it works, Agents, Demo, Pricing, Docs, Security", "API reference with copy-to-clipboard snippets and Try it", "Per-agent detail pages with example output", "Demo storyboard player with chapters"] },
  { v: "v0.2", date: "2026-10-14", title: "Dashboard and live data", items: ["Task board, git-log timeline and flow graph", "Export projects as JSON or Markdown", "GET /api/stats, /api/stack and /api/openapi", "Static GitHub Pages demo with mock data"] },
  { v: "v0.1", date: "2026-10-01", title: "First crew", items: ["Eight lead agents with 24 sub-agents", "Projects API with Zod validation", "Clerk authentication and demo mode", "Landing page and pipeline diagram"] },
];

export default function ChangelogPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Changelog" title={<>What <span className="gh-text-gradient">shipped</span>, and when</>} lead="Three releases so far. Each one is built and reviewed by the same crew you see on this site." />
        <Section title="Releases" kicker="Newest first">
          <ol className="relative space-y-5 border-l border-[var(--gh-line)] pl-6">
            {RELEASES.map((r) => (
              <li key={r.v} className="relative">
                <span className="gh-rivet absolute -left-[30px] top-5" />
                <Panel>
                  <div className="flex flex-wrap items-baseline gap-3"><span className="gh-hud">{r.v}</span><time className="text-xs text-[var(--gh-text-dim)]">{r.date}</time></div>
                  <h3 className="mt-2 text-lg font-medium text-white">{r.title}</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </Panel>
              </li>
            ))}
          </ol>
        </Section>
        <Section title="Up next" kicker="Roadmap">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><h3 className="font-medium text-white">Streaming runs</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Live agent output over server-sent events.</p></Panel>
            <Panel><h3 className="font-medium text-white">Custom agents</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Define your own side agents in the catalog.</p></Panel>
            <Panel><h3 className="font-medium text-white">Template library</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Start from CRM, marketplace or SaaS-starter briefs.</p></Panel>
          </div>
        </Section>
        <Section title="Related" kicker="Links">
          <div className="grid gap-4 sm:grid-cols-3">
            <LinkCard href="/docs/quick-start" title="Quick start" desc="Run the latest release locally." />
            <LinkCard href="/api-reference" title="API reference" desc="Endpoints added in v0.2." />
            <LinkCard href="/security" title="Security" desc="How each release is audited." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
