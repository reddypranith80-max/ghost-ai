import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { AgentSpec } from "@/lib/agent-catalog";

export const btnPrimary =
  "gh-bevel inline-flex items-center justify-center gap-2 bg-[#22e5ff] px-6 py-3 text-sm font-medium text-[#05060d] transition-colors hover:bg-[#6cf0ff] gh-box-glow";
export const btnGhost =
  "gh-bevel inline-flex items-center justify-center gap-2 border border-[var(--gh-line)] bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10";

export const COLOR: Record<AgentSpec["color"], { text: string; ring: string; bg: string }> = {
  cyan: { text: "text-cyan-300", ring: "border-cyan-400/40", bg: "bg-cyan-400/10" },
  violet: { text: "text-violet-300", ring: "border-violet-400/40", bg: "bg-violet-400/10" },
  emerald: { text: "text-emerald-300", ring: "border-emerald-400/40", bg: "bg-emerald-400/10" },
  amber: { text: "text-amber-300", ring: "border-amber-400/40", bg: "bg-amber-400/10" },
  rose: { text: "text-rose-300", ring: "border-rose-400/40", bg: "bg-rose-400/10" },
  sky: { text: "text-sky-300", ring: "border-sky-400/40", bg: "bg-sky-400/10" },
  fuchsia: { text: "text-fuchsia-300", ring: "border-fuchsia-400/40", bg: "bg-fuchsia-400/10" },
  lime: { text: "text-lime-300", ring: "border-lime-400/40", bg: "bg-lime-400/10" },
};

export function Page({ children }: { children: ReactNode }) {
  return <main className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">{children}</main>;
}

export function Hero({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead: string; children?: ReactNode }) {
  return (
    <header className="relative pb-10 pt-14 sm:pt-20">
      <div className="gh-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-40" />
      <p className="gh-hud mb-3">{eyebrow}</p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--gh-text-dim)] sm:text-lg">{lead}</p>
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

export function Section({ id, kicker, title, children }: { id?: string; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-8 sm:py-10">
      {kicker && <p className="gh-hud mb-2">{kicker}</p>}
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      {children}
    </section>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`gh-glass gh-bevel relative p-5 ${className}`}>
      <span className="gh-rivet absolute left-4 top-2" />
      <span className="gh-rivet absolute right-8 top-2" />
      {children}
    </div>
  );
}

export function LinkCard({ href, title, desc, tag }: { href: string; title: string; desc: string; tag?: string }) {
  return (
    <Link href={href} className="group block">
      <Panel className="h-full transition-colors group-hover:border-cyan-400/50">
        {tag && <p className="gh-hud mb-2">{tag}</p>}
        <h3 className="flex items-center justify-between font-medium text-white">
          {title}
          <ArrowRight className="size-4 text-cyan-300 transition-transform group-hover:translate-x-1" />
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--gh-text-dim)]">{desc}</p>
      </Panel>
    </Link>
  );
}

export function CtaBand({ title = "See the crew work on your own brief", sub = "Open the live dashboard, describe a SaaS idea and watch eight agents build it." }: { title?: string; sub?: string }) {
  return (
    <section className="py-10">
      <Panel className="flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[var(--gh-text-dim)]">{sub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className={btnPrimary}>Try the live dashboard <ArrowRight className="size-4" /></Link>
          <Link href="/docs" className={btnGhost}>Read the docs</Link>
        </div>
      </Panel>
    </section>
  );
}

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
