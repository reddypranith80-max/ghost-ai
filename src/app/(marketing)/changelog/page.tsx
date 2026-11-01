import type { Metadata } from "next";
import { Radio, Wrench, LayoutTemplate } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, LinkCard, CtaBand, Feature } from "@/components/marketing/ui";

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
          <ol className="relative">
            <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[var(--mint)]/60 via-white/10 to-transparent" />
            {RELEASES.map((r, i) => (
              <li key={r.v} className="relative grid gap-3 pb-12 pl-9 last:pb-0 md:grid-cols-[150px_1fr] md:gap-8">
                <span aria-hidden className={`absolute left-0 top-1.5 size-[15px] rounded-full ring-4 ring-[var(--ink)] ${i === 0 ? "bg-[var(--mint)] shadow-[0_0_14px_rgba(62,230,160,0.7)]" : "bg-[var(--surface-3)] shadow-[0_0_0_1px_var(--hairline-strong)]"}`} />
                <div className="md:pt-0.5">
                  <span className={`chip ${i === 0 ? "chip-mint" : ""}`}>{r.v}</span>
                  <time className="mt-2 block text-sm text-[var(--text-faint)]">{r.date}</time>
                </div>
                <div className="surface p-6">
                  <h3 className="text-lg font-semibold text-[var(--text)]">{r.title}</h3>
                  <ul className="mt-4 space-y-2.5">{r.items.map((it) => <li key={it} className="flex gap-3 text-sm text-[var(--text-muted)]"><span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-[var(--text-faint)]" />{it}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        <Section title="Up next" kicker="Roadmap">
          <div className="grid gap-10 md:grid-cols-3">
            <Feature icon={Radio} tone="mint" title="Streaming runs">Live agent output over server-sent events.</Feature>
            <Feature icon={Wrench} tone="blue" title="Custom agents">Define your own side agents in the catalog.</Feature>
            <Feature icon={LayoutTemplate} tone="amber" title="Template library">Start from CRM, marketplace or SaaS-starter briefs.</Feature>
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
