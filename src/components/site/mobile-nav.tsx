"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { GITHUB_URL, NAV_LINKS } from "./nav-data";

export function MobileNav({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center border border-[var(--gh-line)] text-[#dbe3ff] hover:text-[var(--gh-cyan)]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Site menu"
          className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-[#05060d]/95 px-4 pb-10 pt-4 backdrop-blur-xl"
        >
          <p className="gh-hud mb-3">{"// navigation"}</p>
          <nav className="flex flex-col">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-[var(--gh-line)] py-4 font-display text-xl text-[#e8ecff] hover:text-[var(--gh-cyan)]"
              >
                <span>
                  <span className="mr-3 font-mono text-xs text-[var(--gh-cyan)]">0{i + 1}</span>
                  {l.label}
                </span>
                <ArrowUpRight className="size-4 opacity-60" />
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border-b border-[var(--gh-line)] py-4 font-display text-xl text-[#e8ecff]"
            >
              <span>
                <span className="mr-3 font-mono text-xs text-[var(--gh-cyan)]">06</span>GitHub
              </span>
              <ArrowUpRight className="size-4 opacity-60" />
            </a>
          </nav>
          <div className="mt-6 flex flex-col gap-3" onClick={() => setOpen(false)}>
            {children}
            <Link href="/dashboard" className="gh-btn gh-btn-primary gh-btn-lg w-full">
              Launch app
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
