import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GITHUB_URL } from "./nav-data";

const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/agents", label: "The agent crew" },
      { href: "/demo", label: "Demo" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Launch app" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/api-reference", label: "API reference" },
      { href: "/changelog", label: "Changelog" },
      { href: GITHUB_URL, label: "GitHub", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/security", label: "Security" },
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
      { href: `${GITHUB_URL}/issues`, label: "Report an issue", external: true },
    ],
  },
];

const POWERED = ["Next.js", "Clerk", "Drizzle", "shadcn/ui", "CodeRabbit", "Vercel"];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[var(--gh-line)] bg-[#04050b]">
      <div className="absolute inset-0 gh-dots opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="Ghost AI home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--gh-text-dim)]">
              Eight specialised agents that plan, build, test, secure, document and review your SaaS, with every
              commit on the record.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-emerald-300">
              <span className="gh-pulse size-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </div>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="gh-hud mb-4">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#b8c0e6] transition-colors hover:text-[var(--gh-cyan)]"
                      >
                        {l.label} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-[#b8c0e6] transition-colors hover:text-[var(--gh-cyan)]">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--gh-line)] pt-6">
          <p className="gh-hud mb-3 !text-[var(--gh-text-dim)]">Powered by</p>
          <ul className="flex flex-wrap gap-2">
            {POWERED.map((p) => (
              <li
                key={p}
                className="border border-[var(--gh-line)] bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-[#c9d1f5]"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-xs text-[var(--gh-text-dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ghost AI. Built by agents, reviewed by humans.</p>
          <p className="font-mono">build: ghost-ai / main · v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
