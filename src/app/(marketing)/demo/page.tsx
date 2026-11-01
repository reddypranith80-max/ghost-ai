import type { Metadata } from "next";
import { FileText, GitMerge, Gavel } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, LinkCard, CtaBand, Feature } from "@/components/marketing/ui";
import { DemoPlayer } from "@/components/marketing/demo-player";

export const metadata: Metadata = { title: "Demo | Ghost AI", description: "Watch Ghost AI turn a brief into a shipped SaaS in under a minute." };

export default function DemoPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Demo" title={<>Watch the crew <span className="gh-text-gradient">build a SaaS</span></>} lead="A 40-second walkthrough: brief in, eight agents out, Go / No-Go at the end. Jump between chapters on the right." />
        <Section title="Walkthrough" kicker="Play"><DemoPlayer /></Section>
        <Section title="What you will see" kicker="Highlights">
          <div className="grid gap-10 md:grid-cols-3">
            <Feature icon={FileText} tone="mint" title="A real brief">Name, description and stack are validated before any agent starts.</Feature>
            <Feature icon={GitMerge} tone="blue" title="Agents in parallel">Backend and Frontend commit side by side. Tasks move from todo to done.</Feature>
            <Feature icon={Gavel} tone="amber" title="A clear verdict">The Reviewer lists required fixes or gives a Go. Export the result as JSON or Markdown.</Feature>
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
