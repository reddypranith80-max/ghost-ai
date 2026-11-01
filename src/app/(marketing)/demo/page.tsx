import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand } from "@/components/marketing/ui";
import { DemoPlayer } from "@/components/marketing/demo-player";

export const metadata: Metadata = { title: "Demo | Ghost AI", description: "Watch Ghost AI turn a brief into a shipped SaaS in under a minute." };

export default function DemoPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Demo" title={<>Watch the crew <span className="gh-text-gradient">build a SaaS</span></>} lead="A 40-second walkthrough: brief in, eight agents out, Go / No-Go at the end. Jump between chapters on the right." />
        <Section title="Walkthrough" kicker="Play"><DemoPlayer /></Section>
        <Section title="What you will see" kicker="Highlights">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><h3 className="font-medium text-white">A real brief</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Name, description and stack are validated before any agent starts.</p></Panel>
            <Panel><h3 className="font-medium text-white">Agents in parallel</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Backend and Frontend commit side by side. Tasks move from todo to done.</p></Panel>
            <Panel><h3 className="font-medium text-white">A clear verdict</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">The Reviewer lists required fixes or gives a Go. Export the result as JSON or Markdown.</p></Panel>
          </div>
        </Section>
        <Section title="Go deeper" kicker="Next">
          <div className="grid gap-4 sm:grid-cols-3">
            <LinkCard href="/how-it-works" title="How it works" desc="Every step of the pipeline in simple words." />
            <LinkCard href="/agents" title="Meet the agents" desc="Search all eight leads and 24 side agents." />
            <LinkCard href="/pricing" title="Pricing" desc="Free Hobby plan, Pro and Team (demo pricing)." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
