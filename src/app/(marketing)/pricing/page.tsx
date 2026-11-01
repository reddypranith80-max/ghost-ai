import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, Panel, CtaBand, btnPrimary, btnGhost } from "@/components/marketing/ui";

export const metadata: Metadata = { title: "Pricing | Ghost AI", description: "Demo pricing for Hobby, Pro and Team plans. No real billing." };

const TIERS = [
  { name: "Hobby", price: "$0", per: "forever", blurb: "Explore the crew on side projects.", cta: "Start free", href: "/dashboard", hot: false },
  { name: "Pro", price: "$29", per: "per month", blurb: "For solo founders shipping real products.", cta: "Try Pro (demo)", href: "/dashboard", hot: true },
  { name: "Team", price: "$99", per: "per month", blurb: "Shared projects for small teams.", cta: "Try Team (demo)", href: "/dashboard", hot: false },
];
const ROWS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["Projects", "3", "Unlimited", "Unlimited"],
  ["Lead agents", "8", "8", "8"],
  ["Sub-agents", "24", "24", "24 + custom"],
  ["Parallel runs", "1", "4", "12"],
  ["Task board and git log", true, true, true],
  ["Export JSON / Markdown", true, true, true],
  ["Security audit pass", "Basic", "Full", "Full"],
  ["Reviewer Go / No-Go", true, true, true],
  ["Team seats", "1", "1", "10"],
  ["API access", false, true, true],
  ["Priority support", false, false, true],
];
const FAQ = [
  ["Is this real pricing?", "No. This is a portfolio demo. There is no billing, no card form and no account charge anywhere on this site."],
  ["Can I use Ghost AI for free?", "Yes. The dashboard works in demo mode without signing up."],
  ["What would a paid plan add?", "More parallel runs, API access, team seats and deeper security scans."],
  ["Where does my data go?", "In demo mode nothing leaves your browser session. See the security page for the full picture."],
  ["Can I self-host?", "Yes. See the deploy guide for Docker and Vercel instructions."],
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto size-4 text-emerald-300" aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto size-4 text-white/30" aria-label="Not included" />;
  return <>{v}</>;
}

export default function PricingPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Pricing" title={<>Simple plans, <span className="gh-text-gradient">zero billing</span></>} lead="These tiers are illustrative demo pricing. Nothing here charges you." />
        <Section title="Choose a plan" kicker="Demo pricing">
          <div className="grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <Panel key={t.name} className={t.hot ? "gh-box-glow" : ""}>
                <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-white">{t.name}</h3>{t.hot && <span className="gh-hud">Popular</span>}</div>
                <p className="mt-3 text-4xl font-semibold text-white">{t.price}<span className="ml-1 text-sm font-normal text-[var(--gh-text-dim)]">{t.per}</span></p>
                <p className="mt-2 text-sm text-[var(--gh-text-dim)]">{t.blurb}</p>
                <Link href={t.href} className={`${t.hot ? btnPrimary : btnGhost} mt-5 w-full`}>{t.cta}</Link>
              </Panel>
            ))}
          </div>
        </Section>
        <Section title="Compare plans" kicker="Details">
          <div className="gh-glass overflow-x-auto rounded-md">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b border-[var(--gh-line)] text-left"><th className="p-3 font-medium text-white">Feature</th>{TIERS.map((t) => <th key={t.name} className="p-3 text-center font-medium text-white">{t.name}</th>)}</tr></thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r[0]} className="border-b border-[var(--gh-line)] last:border-0">
                    <td className="p-3 text-white/85">{r[0]}</td>
                    {[r[1], r[2], r[3]].map((v, i) => <td key={i} className="p-3 text-center text-white/80"><Cell v={v} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Frequently asked questions" kicker="FAQ">
          <div className="grid gap-3 md:grid-cols-2">
            {FAQ.map(([q, a]) => (
              <Panel key={q}><h3 className="font-medium text-white">{q}</h3><p className="mt-2 text-sm text-[var(--gh-text-dim)]">{a}</p></Panel>
            ))}
          </div>
        </Section>
        <Section title="Still deciding?" kicker="Explore">
          <p className="text-sm text-[var(--gh-text-dim)]">Watch the <Link href="/demo" className="text-cyan-300 underline">demo</Link>, meet the <Link href="/agents" className="text-cyan-300 underline">agents</Link> or read the <Link href="/docs" className="text-cyan-300 underline">docs</Link>.</p>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
