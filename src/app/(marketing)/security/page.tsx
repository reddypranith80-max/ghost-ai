import type { Metadata } from "next";
import { KeyRound, ShieldCheck, Package, GitPullRequest, Lock, Eye } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, LinkCard, CtaBand } from "@/components/marketing/ui";
import { Code } from "@/components/marketing/copy-button";

export const metadata: Metadata = { title: "Security | Ghost AI", description: "How Ghost AI protects projects: Clerk auth, Zod validation, CSP headers, dependency scans and CodeRabbit reviews." };

const PRACTICES = [
  { icon: KeyRound, t: "Clerk authentication", d: "Sessions, sign-in and user management are delegated to Clerk. Protected routes verify the session on the server." },
  { icon: ShieldCheck, t: "Zod validation", d: "Every request body is parsed against a Zod schema from contracts.ts. Bad input gets a 400, never reaches the database." },
  { icon: Lock, t: "CSP and security headers", d: "Content-Security-Policy, frame-ancestors none, no-sniff and strict referrer policy are set on every response." },
  { icon: Package, t: "Dependency scans", d: "The Dependency Dog runs npm audit in CI. High or critical findings fail the build." },
  { icon: GitPullRequest, t: "CodeRabbit reviews", d: "Each pull request gets an automated review, then the Reviewer agent checks the definition of done." },
  { icon: Eye, t: "Secret hygiene", d: "The Secret Sniffer scans for leaked keys. Only public keys are exposed to the browser." },
];

export default function SecurityPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Security" title={<>Built to be <span className="gh-text-gradient">hard to break</span></>} lead="The AEGIS agent audits every build, and the same practices protect this site. Here is what we do, in plain language." />
        <Section title="Practices" kicker="What we do">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRACTICES.map(({ icon: I, t, d }) => (
              <Panel key={t}><I className="size-5 text-cyan-300" /><h3 className="mt-3 font-medium text-white">{t}</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">{d}</p></Panel>
            ))}
          </div>
        </Section>
        <Section title="Example headers" kicker="Config">
          <Code title="next.config headers" code={`Content-Security-Policy: default-src 'self'; frame-ancestors 'none'\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=()`} />
        </Section>
        <Section title="Threat model in short" kicker="Think like an attacker">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel><h3 className="font-medium text-white">Bad input</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Mitigated by Zod schemas and parameterised queries through Drizzle.</p></Panel>
            <Panel><h3 className="font-medium text-white">Stolen access</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Mitigated by Clerk sessions, role checks and short-lived tokens.</p></Panel>
            <Panel><h3 className="font-medium text-white">Vulnerable packages</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">Mitigated by audits in CI and a small dependency list.</p></Panel>
          </div>
        </Section>
        <Section title="Report an issue" kicker="Responsible disclosure">
          <Panel><p className="text-sm text-white/85">Found something? Open a private security advisory on the repository with steps to reproduce. This is a demo project, so there is no bounty, but reports are welcome and credited.</p></Panel>
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
