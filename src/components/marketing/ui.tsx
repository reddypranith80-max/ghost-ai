import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { AgentSpec } from "@/lib/agent-catalog";

export const btnPrimary = "btn btn-primary btn-lg";
export const btnGhost = "btn btn-secondary btn-lg";

/** Per-agent accent. Apply `accentStyle(color)` on a wrapper, then use `var(--a)` inside. */
export function accentStyle(color: AgentSpec["color"]): CSSProperties {
  return { "--a": `var(--agent-${color})` } as CSSProperties;
}
/** Tailwind helpers that read the --a variable set by accentStyle. */
export const ACCENT = {
  text: "text-[var(--a)]",
  tint: "bg-[color-mix(in_srgb,var(--a)_14%,transparent)]",
  chip: "bg-[color-mix(in_srgb,var(--a)_13%,transparent)] text-[var(--a)]",
  dot: "bg-[var(--a)]",
};

export function Page({ children }: { children: ReactNode }) {
  return <div className="relative pb-12">{children}</div>;
}

export function Hero({ eyebrow, title, lead, children, accent }: { eyebrow: string; title: ReactNode; lead: string; children?: ReactNode; accent?: AgentSpec["color"] }) {
  return (
    <header className="relative overflow-hidden" style={accent ? accentStyle(accent) : undefined}>
      <div className="bg-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      {accent && <div aria-hidden className="pointer-events-none absolute -top-32 right-[8%] h-80 w-[34rem] rounded-full bg-[var(--a)] opacity-[0.10] blur-[110px]" />}
      <div className="bg-dots fade-mask-b pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="container-page relative pb-14 pt-16 sm:pb-20 sm:pt-24">
        <p className={`eyebrow reveal ${accent ? "!text-[var(--a)]" : ""}`}>{eyebrow}</p>
        <h1 className="h-display reveal reveal-1 mt-4 max-w-3xl text-[clamp(2.25rem,5.4vw,4rem)]">{title}</h1>
        <p className="reveal reveal-2 mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{lead}</p>
        {children && <div className="reveal reveal-3 mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  );
}

export function Section({ id, kicker, title, children }: { id?: string; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="container-page scroll-mt-24 py-10 sm:py-14">
      <div className="mb-7 max-w-2xl">
        {kicker && <p className="eyebrow mb-2">{kicker}</p>}
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-[1.75rem]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface relative p-6 ${className}`}>{children}</div>;
}

export function LinkCard({ href, title, desc, tag }: { href: string; title: string; desc: string; tag?: string }) {
  return (
    <Link href={href} className="group block h-full rounded-[var(--r-card)]">
      <div className="surface card-lift h-full p-6">
        {tag && <p className="mb-3 text-xs font-medium text-[var(--text-faint)]">{tag}</p>}
        <h3 className="flex items-center justify-between gap-3 text-[1.0625rem] font-semibold text-[var(--text)]">
          {title}
          <ArrowRight className="size-4 shrink-0 text-[var(--text-faint)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--mint)]" />
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{desc}</p>
      </div>
    </Link>
  );
}

export function CtaBand({ title = "See the crew work on your own brief", sub = "Open the live dashboard, describe a SaaS idea and watch eight agents build it." }: { title?: string; sub?: string }) {
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="surface-raised relative overflow-hidden px-7 py-10 sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-96 rounded-full bg-[var(--mint)] opacity-[0.10] blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 h-60 w-80 rounded-full bg-[var(--blue)] opacity-[0.08] blur-[90px]" />
        <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h2 className="h-display text-2xl sm:text-[2rem]">{title}</h2>
            <p className="mt-3 text-[var(--text-muted)]">{sub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className={btnPrimary}>Try the live dashboard <ArrowRight className="size-4" /></Link>
            <Link href="/docs" className={btnGhost}>Read the docs</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small inline text link used in prose. */
export const textLink = "text-[var(--blue)] underline decoration-[var(--blue)]/30 underline-offset-4 transition-colors hover:decoration-[var(--blue)]";

const TONES = {
  mint: "bg-[var(--mint-tint)] text-[var(--mint)]",
  amber: "bg-[var(--amber-tint)] text-[var(--amber)]",
  blue: "bg-[var(--blue-tint)] text-[var(--blue)]",
  coral: "bg-[var(--coral-tint)] text-[var(--coral)]",
} as const;

/** Open (borderless) feature column: icon tile, title, copy. */
export function Feature({ icon: Icon, tone = "mint", title, children }: { icon: React.ComponentType<{ className?: string }>; tone?: keyof typeof TONES; title: string; children: ReactNode }) {
  return (
    <div>
      <span className={`grid size-10 place-items-center rounded-[12px] ${TONES[tone]}`}><Icon className="size-5" /></span>
      <h3 className="mt-4 text-[1.0625rem] font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{children}</p>
    </div>
  );
}

export const basePath =process.env.NEXT_PUBLIC_BASE_PATH || "";
