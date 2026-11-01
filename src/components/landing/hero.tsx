"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { AgentTerminal } from "./agent-terminal";
import { PipelineDiagram } from "./pipeline-diagram";
import { Reveal } from "./reveal";

const WORDS = ["Describe", "it.", "Ghost", "ships", "it."];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--gh-line)]">
      <div className="gh-aurora absolute inset-0" />
      <div className="gh-grid absolute inset-0 opacity-60" />
      <div className="gh-noise absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-20 lg:pt-20">
        <div>
          <p className="gh-rise gh-hud mb-5 inline-flex items-center gap-2 border border-[var(--gh-line)] bg-white/[0.03] px-3 py-1.5">
            <span className="gh-pulse size-1.5 rounded-full bg-[var(--gh-cyan)]" />
            v0.1 // 8 agents online
          </p>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {WORDS.map((w, i) => (
              <span
                key={i}
                className={`gh-rise mr-[0.25em] inline-block ${i >= 2 ? "gh-text-gradient" : ""}`}
                style={{ animationDelay: `${0.1 + i * 0.09}s` }}
              >
                {w}
              </span>
            ))}
          </h1>
          <p className="gh-rise mt-6 max-w-xl text-base leading-relaxed text-[#b8c0e6] sm:text-lg" style={{ animationDelay: "0.6s" }}>
            Give Ghost AI a goal and a tech stack. A crew of eight specialised agents and their sidekicks plan the
            work, write the code, test it, harden it, document it and hand you a reviewed, shippable SaaS, with every
            commit on the record.
          </p>
          <div className="gh-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.75s" }}>
            <Link href="/dashboard" className="gh-btn gh-btn-primary gh-btn-lg">
              Launch the app <ArrowRight className="size-4" />
            </Link>
            <Link href="/demo" className="gh-btn gh-btn-ghost gh-btn-lg">
              <PlayCircle className="size-4" /> Watch the demo
            </Link>
          </div>
          <dl className="gh-rise mt-8 grid max-w-md grid-cols-3 gap-3 font-mono text-xs" style={{ animationDelay: "0.9s" }}>
            {[
              ["8", "lead agents"],
              ["24", "sub-agents"],
              ["0", "secrets to run"],
            ].map(([n, l]) => (
              <div key={l} className="border-l-2 border-[var(--gh-cyan)]/60 pl-3">
                <dt className="font-display text-2xl font-bold text-white">{n}</dt>
                <dd className="text-[var(--gh-text-dim)]">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="gh-rise min-w-0" style={{ animationDelay: "0.4s" }}>
          <AgentTerminal />
        </div>
      </div>

      <Reveal>
        <div className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="gh-panel gh-corners relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="gh-hud">pipeline // architect → reviewer</span>
              <span className="font-mono text-[0.65rem] text-[var(--gh-text-dim)]">7 stages · live flow</span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <PipelineDiagram />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Counter({ to, suffix = "", started }: { to: number; suffix?: string; started: boolean }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / 1400));
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to]);
  return (
    <>
      {v.toLocaleString("en-US")}
      {suffix}
    </>
  );
}

const STATS = [
  { n: 8, s: "", l: "Lead agents", d: "Architect to Reviewer, each with a codename and toolset." },
  { n: 24, s: "", l: "Sub-agents", d: "Three specialist sidekicks per lead for focused chores." },
  { n: 1200, s: "+", l: "Tasks planned", d: "Across demo projects, split by module and owner." },
  { n: 100, s: "%", l: "Commits traceable", d: "Every change carries an agent, hash and file count." },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && (setStarted(true), io.disconnect()), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="relative border-b border-[var(--gh-line)] bg-[#070a16]">
      <div ref={ref} className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[var(--gh-line)] px-0 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="relative bg-[#070a16] p-5 sm:p-8">
            <span className="gh-rivet absolute right-3 top-3" />
            <p className="font-display text-4xl font-bold text-white sm:text-5xl">
              <span className="gh-text-gradient">
                <Counter to={s.n} suffix={s.s} started={started} />
              </span>
            </p>
            <p className="gh-hud mt-2 !text-[0.65rem]">{s.l}</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--gh-text-dim)] sm:text-sm">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
