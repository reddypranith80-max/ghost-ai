import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, CtaBand, btnGhost } from "@/components/marketing/ui";
import { ApiExplorer } from "@/components/marketing/api-explorer";
import { Code } from "@/components/marketing/copy-button";

export const metadata: Metadata = { title: "API reference | Ghost AI", description: "Every Ghost AI API route with curl examples, JSON responses and a Try it button." };

export default function ApiReferencePage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="API reference" title={<>13 endpoints, <span className="gh-text-gradient">all JSON</span></>} lead="Create projects, watch tasks and git logs, inspect agents and export results. Copy any snippet or press Try it to call the endpoint right from this page.">
          <Link href="/docs/auth" className={btnGhost}>Authentication</Link>
          <Link href="/docs" className={btnGhost}>All docs</Link>
        </Hero>
        <Section title="Conventions" kicker="Before you start">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><h3 className="font-medium text-white">Format</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Requests and responses are JSON. Inputs are validated with Zod; invalid input returns 400 with an error list.</p></Panel>
            <Panel><h3 className="font-medium text-white">Auth</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">The hosted app uses Clerk sessions. In demo mode all routes are open and backed by mock data.</p></Panel>
            <Panel><h3 className="font-medium text-white">Static demo</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">The GitHub Pages build has no API, so Try it shows a friendly message there. Run locally for live responses.</p></Panel>
          </div>
          <div className="mt-4"><Code title="error shape" code={`{ "error": "Validation failed", "issues": [{ "path": ["name"], "message": "Too short" }] }`} /></div>
        </Section>
        <Section title="Endpoints" kicker="Reference"><ApiExplorer /></Section>
        <Section title="Related" kicker="Next">
          <p className="text-sm text-[var(--gh-text-dim)]">New here? Start with the <Link className="text-cyan-300 underline" href="/docs/quick-start">Quick start</Link>, learn the <Link className="text-cyan-300 underline" href="/agents">agents</Link>, or read <Link className="text-cyan-300 underline" href="/security">security practices</Link>.</p>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
