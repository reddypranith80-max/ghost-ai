import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Page, Hero, Section, CtaBand, btnPrimary, btnGhost, textLink } from "@/components/marketing/ui";

export const metadata: Metadata = { title: "Pricing | Ghost AI", description: "Demo pricing for Hobby, Pro and Team plans. No real billing." };

const TIERS = [
  { name: "Hobby", price: "$0", per: "forever", blurb: "Explore the crew on side projects.", cta: "Start free", href: "/dashboard", hot: false, perks: ["3 projects", "All 8 lead agents", "Basic security audit"] },
  { name: "Pro", price: "$29", per: "per month", blurb: "For solo founders shipping real products.", cta: "Try Pro (demo)", href: "/dashboard", hot: true, perks: ["Unlimited projects", "4 parallel runs", "API access and full security audit"] },
  { name: "Team", price: "$99", per: "per month", blurb: "Shared projects for small teams.", cta: "Try Team (demo)", href: "/dashboard", hot: false, perks: ["10 team seats", "12 parallel runs", "Custom side agents and priority support"] },
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
  if (v === true) return <Check className="mx-auto size-4 text-[var(--mint)]" aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto size-4 text-white/25" aria-label="Not included" />;
  return <>{v}</>;
}

export default function PricingPage() {
  return (
    <SiteShell>
      <Page>
        <Hero eyebrow="Pricing" title={<>Simple plans, <span className="gh-text-gradient">zero billing</span></>} lead="These tiers are illustrative demo pricing. Nothing here charges you." />
        <Section title="Choose a plan" kicker="Demo pricing">
          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`relative flex flex-col overflow-hidden p-7 ${t.hot ? "surface-raised !shadow-[var(--inner-top),0_0_0_1px_rgba(62,230,160,0.35),0_30px_70px_-30px_rgba(62,230,160,0.35)]" : "surface"}`}>
                {t.hot && <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[var(--mint)] opacity-[0.13] blur-[70px]" />}
                <div className="relative flex items-center justify-between"><h3 className="text-lg font-semibold text-[var(--text)]">{t.name}</h3>{t.hot && <span className="chip chip-mint">Popular</span>}</div>
                <p className="relative mt-5 font-[family-name:var(--font-display)] text-5xl font-bold tracking-[-0.04em] text-[var(--text)]">{t.price}<span className="ml-2 font-[family-name:var(--font-body)] text-sm font-normal tracking-normal text-[var(--text-muted)]">{t.per}</span></p>
                <p className="relative mt-3 text-sm text-[var(--text-muted)]">{t.blurb}</p>
                <ul className="relative mt-6 flex-1 space-y-2.5">
                  {t.perks.map((p) => <li key={p} className="flex items-start gap-2.5 text-sm text-[var(--text)]"><Check className={`mt-0.5 size-4 shrink-0 ${t.hot ? "text-[var(--mint)]" : "text-[var(--text-faint)]"}`} aria-hidden />{p}</li>)}
                </ul>
                <Link href={t.href} className={`${t.hot ? btnPrimary : btnGhost} relative mt-8 w-full`}>{t.cta}</Link>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Compare plans" kicker="Details">
          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="text-left"><th className="px-5 py-4 font-medium text-[var(--text-faint)]">Feature</th>{TIERS.map((t) => <th key={t.name} className={`px-5 py-4 text-center font-semibold ${t.hot ? "text-[var(--mint)]" : "text-[var(--text)]"}`}>{t.name}</th>)}</tr></thead>
              <tbody>
                {ROWS.map((r, ri) => (
                  <tr key={r[0]} className={ri % 2 === 0 ? "bg-white/[0.025]" : ""}>
                    <td className="px-5 py-3.5 text-[var(--text)]">{r[0]}</td>
                    {[r[1], r[2], r[3]].map((v, i) => <td key={i} className="px-5 py-3.5 text-center text-[var(--text-muted)]"><Cell v={v} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Frequently asked questions" kicker="FAQ">
          <div className="grid gap-x-14 gap-y-9 md:grid-cols-2">
            {FAQ.map(([q, a]) => (
              <div key={q}><h3 className="font-semibold text-[var(--text)]">{q}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{a}</p></div>
            ))}
          </div>
        </Section>
        <Section title="Still deciding?" kicker="Explore">
          <p className="max-w-2xl text-[var(--text-muted)]">Watch the <Link href="/demo" className={textLink}>demo</Link>, meet the <Link href="/agents" className={textLink}>agents</Link> or read the <Link href="/docs" className={textLink}>docs</Link>.</p>
        </Section>
        <CtaBand />
      </Page>
    </SiteShell>
  );
}
