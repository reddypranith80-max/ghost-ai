import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthNav } from "@/components/auth/auth-nav";
import { MobileNav } from "./mobile-nav";
import { GITHUB_URL, NAV_LINKS } from "./nav-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[var(--gh-line)] bg-[#05060d]/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gh-cyan)]/60 to-transparent" />
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Ghost AI home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--gh-text-dim)] transition-colors hover:text-[var(--gh-cyan)]"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--gh-text-dim)] transition-colors hover:text-[var(--gh-cyan)]"
          >
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <AuthNav />
            <Link href="/dashboard" className="gh-btn gh-btn-primary">
              Launch app
            </Link>
          </div>
          <MobileNav>
            <AuthNav />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
