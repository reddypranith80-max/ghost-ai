"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";
import type { AgentName, TaskStatus } from "@/lib/contracts";
import { STATUS_META, agentHex } from "@/lib/sim";
import { getAgentSpec } from "@/lib/agent-catalog";

export const hud = "gh-hud !text-[10px] !tracking-[0.16em]";
export const field =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function Panel({
  title, icon, right, children, className, bodyClass, live,
}: { title?: string; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; live?: boolean }) {
  return (
    <section className={cn("gh-glass gh-corners relative min-w-0 rounded-md", className)}>
      {title && (
        <header className="flex items-center gap-2 border-b border-[var(--gh-line)] px-3.5 py-2.5">
          {icon && <span className="text-[var(--acc)] [&_svg]:size-3.5">{icon}</span>}
          <h2 className={hud}>{title}</h2>
          {live && <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
          <div className="ml-auto flex items-center gap-2">{right}</div>
        </header>
      )}
      <div className={cn("p-3.5", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className={hud}>{kicker}</div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Sparkline({ data, color = "var(--acc)", w = 96, h = 30, fill = true }: { data: number[]; color?: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / rng) * (h - 6)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const id = `sg${data.length}${Math.round(data[0] * 10)}${Math.round(data[data.length - 1] * 10)}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity=".35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
    </svg>
  );
}

export function Ring({ value, size = 132, stroke = 10, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gh-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--acc)" strokeWidth={stroke} strokeLinecap="butt"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset .8s ease", filter: "drop-shadow(0 0 6px var(--acc))" }}
        />
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const r1 = r - stroke / 2 - 4, r2 = r1 - 3;
          return <line key={i} x1={size / 2 + Math.cos(a) * r1} y1={size / 2 + Math.sin(a) * r1} x2={size / 2 + Math.cos(a) * r2} y2={size / 2 + Math.sin(a) * r2} stroke="var(--gh-line)" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold tabular-nums">{value}<span className="text-base text-muted-foreground">%</span></span>
        {label && <span className={hud}>{label}</span>}
      </div>
    </div>
  );
}

export function Bar({ value, color = "var(--acc)", className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}12` }}>
      <span className="size-1.5 rounded-full" style={{ background: m.color }} /> {m.label}
    </span>
  );
}

export function AgentTag({ name, className }: { name: AgentName; className?: string }) {
  const c = agentHex(name);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", className)} style={{ color: c, borderColor: `${c}55`, background: `${c}12` }}>
      {getAgentSpec(name).codename}
    </span>
  );
}

export function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex size-2 shrink-0">
      {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: color }} />}
      <span className="relative inline-flex size-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
    </span>
  );
}

export function Empty({ icon, title, hint, action }: { icon: ReactNode; title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-[var(--gh-line)] px-6 py-10 text-center">
      <div className="relative flex size-16 items-center justify-center rounded-full border border-[var(--gh-line)] text-[var(--acc)] [&_svg]:size-7">
        <span className="absolute inset-1 rounded-full border border-dashed border-[var(--gh-line)] [animation:spin_14s_linear_infinite]" />
        {icon}
      </div>
      <h3 className="font-display text-base font-medium">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      {action}
    </div>
  );
}

export function NeedProject({ children }: { children?: ReactNode }) {
  return (
    <Empty
      icon={<span className="font-mono text-2xl">+</span>}
      title="No project selected"
      hint="Create a project and the whole crew gets to work. Everything in this view fills in automatically."
      action={children ?? <Link href="/dashboard/projects" className="gh-btn gh-btn-primary mt-2">Go to Projects</Link>}
    />
  );
}

export const fmtTime = (iso: string) => iso.slice(5, 16).replace("T", " ");
export const fmtClock = (t: number) => new Date(t).toISOString().slice(11, 19);
