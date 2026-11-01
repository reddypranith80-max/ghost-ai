"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";
import type { AgentName, TaskStatus } from "@/lib/contracts";
import { STATUS_META } from "@/lib/sim";
import { getAgentSpec } from "@/lib/agent-catalog";

/* ---------- colour helpers: everything resolves to design-system tokens ---------- */
export const tint = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
export const agentColor = (n: AgentName) => `var(--agent-${getAgentSpec(n).color})`;
export const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
export const codename = (n: AgentName) => cap(getAgentSpec(n).codename);

export const STATUS_UI: Record<TaskStatus, string> = {
  todo: "var(--text-faint)",
  running: "var(--amber)",
  review: "var(--blue)",
  done: "var(--mint)",
  failed: "var(--coral)",
};

/** Quiet form-control surface shared by inputs, selects and textareas. */
export const field =
  "w-full min-w-0 rounded-xl border-0 bg-black/30 px-3 py-2 text-sm text-foreground outline-none transition-[box-shadow,background-color] duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.08)] placeholder:text-[var(--text-faint)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.14)] focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(62,230,160,0.6),0_0_0_4px_rgba(62,230,160,0.14)]";
export const selectField = cn(field, "h-10 cursor-pointer");
export const lbl = "text-[13px] font-medium text-[var(--text-muted)]";
export const optionCls = "bg-[#15181d]";

export function Panel({
  title, icon, right, children, className, bodyClass, live, description,
}: { title?: string; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; live?: boolean; description?: string }) {
  return (
    <section className={cn("surface relative min-w-0 rounded-2xl", className)}>
      {title && (
        <header className="flex items-center gap-2.5 px-5 pb-1 pt-4">
          {icon && <span className="text-[var(--text-faint)] [&_svg]:size-4">{icon}</span>}
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-xs text-[var(--text-faint)]">{description}</p>}
          </div>
          {live && <span className="relative ml-0.5 inline-flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--mint)] opacity-60" /><span className="relative inline-flex size-1.5 rounded-full bg-[var(--mint)]" /></span>}
          <div className="ml-auto flex items-center gap-2 text-[13px]">{right}</div>
        </header>
      )}
      <div className={cn("p-5", title && "pt-3", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHead({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="reveal mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  );
}

/** A quiet link used in panel headers. */
export function SoftLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="rounded-md px-1.5 py-0.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--mint)]">{children}</Link>;
}

export function Sparkline({ data, color = "var(--mint)", w = 96, h = 30, fill = true }: { data: number[]; color?: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / rng) * (h - 6)] as const);
  // smooth path (midpoint curves)
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], mx = (px + x) / 2;
    d += ` C${mx.toFixed(1)} ${py.toFixed(1)}, ${mx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  const id = `sg${data.length}${Math.round(data[0] * 10)}${Math.round(data[data.length - 1] * 10)}${color.length}`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: color }} stopOpacity=".28" />
              <stop offset="1" style={{ stopColor: color }} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" style={{ stroke: color }} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" style={{ fill: color }} />
    </svg>
  );
}

export function Ring({ value, size = 132, stroke = 9, label, color = "var(--mint)" }: { value: number; size?: number; stroke?: number; label?: string; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: color, transition: "stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)" }} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[2rem] font-semibold leading-none tracking-tight tabular-nums">{value}<span className="text-base font-medium text-[var(--text-faint)]">%</span></span>
        {label && <span className="mt-1 text-xs text-[var(--text-faint)]">{label}</span>}
      </div>
    </div>
  );
}

export function Bar({ value, color = "var(--mint)", className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const c = STATUS_UI[status];
  return (
    <span className="chip" style={{ color: c, background: tint(c, 13) }}>
      <span className="size-1.5 rounded-full" style={{ background: c }} /> {STATUS_META[status].label}
    </span>
  );
}

export function AgentTag({ name, className }: { name: AgentName; className?: string }) {
  const c = agentColor(name);
  return (
    <span className={cn("chip", className)} style={{ color: c, background: tint(c, 13) }}>
      {codename(name)}
    </span>
  );
}

/** Small tinted square with the agent's initial. */
export function AgentGlyph({ name, size = 40 }: { name: AgentName; size?: number }) {
  const c = agentColor(name);
  return (
    <div className="flex shrink-0 items-center justify-center rounded-xl font-display font-bold" style={{ width: size, height: size, fontSize: size * 0.42, color: c, background: tint(c, 15) }}>
      {getAgentSpec(name).codename[0]}
    </div>
  );
}

export function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex size-2 shrink-0">
      {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full opacity-50" style={{ background: color }} />}
      <span className="relative inline-flex size-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/[0.05]", className)} aria-hidden />;
}

export function Empty({ icon, title, hint, action }: { icon: ReactNode; title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-6 py-14 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_65%)]" />
      <div className="relative flex size-14 items-center justify-center rounded-2xl text-[var(--mint)] shadow-[var(--inner-top),0_0_0_1px_var(--hairline)] [&_svg]:size-6" style={{ background: "linear-gradient(180deg, var(--surface-3), var(--surface-2))" }}>
        {icon}
      </div>
      <h3 className="relative font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="relative max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">{hint}</p>
      {action && <div className="relative mt-1">{action}</div>}
    </div>
  );
}

export function NeedProject({ children, loading }: { children?: ReactNode; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4" aria-busy>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  return (
    <div className="surface rounded-2xl">
      <Empty
        icon={<span className="font-display text-2xl leading-none">+</span>}
        title="No project selected"
        hint="Create a project and the whole crew gets to work. Everything in this view fills in automatically."
        action={children ?? <Link href="/dashboard/projects" className="btn btn-primary">Go to Projects</Link>}
      />
    </div>
  );
}

export const fmtTime = (iso: string) => iso.slice(5, 16).replace("T", " ");
export const fmtClock = (t: number) => new Date(t).toISOString().slice(11, 19);
