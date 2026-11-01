import type { Metadata } from "next";
import { KeyRound, ShieldCheck, Package, GitPullRequest, Lock, Eye } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand, Feature } from "@/components/marketing/ui";
import { Code } from "@/components/marketing/copy-button";

export const metadata: Metadata = { title: "Security | Ghost AI", description: "How Ghost AI protects projects: Clerk auth, Zod validation, CSP headers, dependency scans and CodeRabbit reviews." };

const PRACTICES = [
  { icon: KeyRound, tone: "mint", t: "Clerk authentication", d: "Sessions, sign-in and user management are delegated to Clerk. Protected routes verify the session on the server." },
  { icon: ShieldCheck, tone: "blue", t: "Zod validation", d: "Every request body is parsed against a Zod schema from contracts.ts. Bad input gets a 400, never reaches the database." },
  { icon: Lock, tone: "amber", t: "CSP and security headers", d: "Content-Security-Policy, frame-ancestors none, no-sniff and strict referrer policy are set on every response." },
  { icon: Package, tone: "coral", t: "Dependency scans", d: "The Dependency Dog runs npm audit in CI. High or critical findings fail the build." },
  { icon: GitPullRequest, tone: "mint", t: "CodeRabbit reviews", d: "Each pull request gets an automated review, then the Reviewer agent checks the definition of done." },
  { icon: Eye, tone: "blue", t: "Secret hygiene", d: "The Secret Sniffer scans for leaked keys. Only public keys are exposed to the browser." },
] as const;

export default function SecurityPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Security" title={<>Built to be <span className="gh-text-gradient">hard to break</span></>} lead="The AEGIS agent audits every build, and the same practices protect this site. Here is what we do, in plain language." />
        <Section title="Practices" kicker="What we do">
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {PRACTICES.map(({ icon, tone, t, d }) => <Feature key={t} icon={icon} tone={tone} title={t}>{d}</Feature>)}
          </div>
        </Section>
        <Section title="Example headers" kicker="Config">
          <Code title="next.config headers" code={`Content-Security-Policy: default-src 'self'; frame-ancestors 'none'\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=()`} />
        </Section>
        <Section title="Threat model in short" kicker="Think like an attacker">
          <div className="grid gap-4 md:grid-cols-3">
            {[["Bad input", "Mitigated by Zod schemas and parameterised queries through Drizzle."], ["Stolen access", "Mitigated by Clerk sessions, role checks and short-lived tokens."], ["Vulnerable packages", "Mitigated by audits in CI and a small dependency list."]].map(([h, p]) => (
              <Panel key={h}><span className="chip chip-coral">Risk</span><h3 className="mt-4 font-semibold text-[var(--text)]">{h}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{p}</p></Panel>
            ))}
          </div>
        </Section>
        <Section title="Report an issue" kicker="Responsible disclosure">
          <div className="surface-raised p-7 sm:p-9"><p className="max-w-3xl leading-relaxed text-[var(--text)]">Found something? Open a private security advisory on the repository with steps to reproduce. This is a demo project, so there is no bounty, but reports are welcome and credited.</p></div>
        </Section>
        <Section title="Related" kicker="Links">
          <div className="grid gap-4 sm:grid-cols-3">
            <LinkCard href="/agents/security" title="Security agent" desc="Meet AEGIS and its three side agents." />
            <LinkCard href="/docs/auth" title="Auth guide" desc="Set up Clerk and demo mode." />
            <LinkCard href="/docs/deploy" title="Deploy guide" desc="Ship with safe defaults." />
          </div>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
