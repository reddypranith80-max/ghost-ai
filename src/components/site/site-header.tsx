import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AuthNav } from "@/components/auth/auth-nav";
import { MobileNav } from "./mobile-nav";
import { GITHUB_URL, NAV_LINKS } from "./nav-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-[#0a0b0d]/72 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-[1160px] items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="Ghost AI home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors duration-150 hover:bg-white/5 hover:text-[var(--text)]"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors duration-150 hover:bg-white/5 hover:text-[var(--text)]"
          >
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <AuthNav />
            <Link href="/dashboard" className="btn btn-primary btn-sm">
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
