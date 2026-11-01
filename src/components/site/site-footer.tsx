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
    <footer className="relative mt-auto bg-[var(--surface-1)] shadow-[0_-1px_0_rgba(255,255,255,0.06)]">
      <div className="bg-dots absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-[1160px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="Ghost AI home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              Eight specialised agents that plan, build, test, secure, document and review your SaaS, with every
              commit on the record.
            </p>
            <div className="mt-5 chip chip-mint">
              <span className="gh-pulse size-1.5 rounded-full bg-[var(--mint)]" />
              All systems operational
            </div>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="mb-4 font-sans text-sm font-semibold tracking-normal text-[var(--text)]">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text)]"
                      >
                        {l.label} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text)]">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-soft mt-12" />
        <div className="pt-8">
          <p className="gh-hud mb-3">Powered by</p>
          <ul className="flex flex-wrap gap-2">
            {POWERED.map((p) => (
              <li
                key={p}
                className="chip"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ghost AI. Built by agents, reviewed by humans.</p>
          <p className="font-mono">build: ghost-ai / main · v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
