"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { Reveal, SectionHead } from "./reveal";

const HEX: Record<string, string> = {
  cyan: "#22e5ff",
  violet: "#a06bff",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  sky: "#38bdf8",
  fuchsia: "#e879f9",
  lime: "#a3e635",
};

export function Crew() {
  const [open, setOpen] = useState<string | null>("Architect");
  return (
    <section className="relative border-b border-[var(--gh-line)] bg-[#070a16] py-16 sm:py-24">
      <div className="gh-scanlines absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHead
            tag="the crew"
            title={
              <>
                Eight leads. <span className="gh-text-gradient">Twenty-four sidekicks.</span>
              </>
            }
            sub="Each lead owns a stage of the pipeline and delegates focused chores to its sub-agents. Tap a card to meet the team."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_CATALOG.map((a, i) => {
            const c = HEX[a.color];
            const isOpen = open === a.name;
            return (
              <Reveal key={a.name} delay={(i % 4) * 0.06}>
                <div
                  className="gh-panel gh-bevel relative h-full"
                  style={{ borderColor: isOpen ? c : undefined, boxShadow: isOpen ? `0 0 28px -10px ${c}` : undefined }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : a.name)}
                    className="flex w-full flex-col p-5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] tracking-[0.2em]" style={{ color: c }}>
                        {String(i + 1).padStart(2, "0")} {"//"} {a.codename}
                      </span>
                      <ChevronDown className={`size-4 text-[var(--gh-text-dim)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-white">{a.name}</h3>
                    <p className="mt-1 text-sm text-[#b8c0e6]">{a.tagline}</p>
                    <p className="mt-3 text-xs text-[var(--gh-text-dim)]">
                      <span className="font-mono uppercase" style={{ color: c }}>
                        ships:{" "}
                      </span>
                      {a.produces}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.tools.map((t) => (
                        <span key={t} className="border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[0.62rem] text-[#c9d1f5]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                  {isOpen && (
                    <ul className="space-y-2 border-t border-dashed border-[var(--gh-line)] p-5 pt-4">
                      {a.subAgents.map((s) => (
                        <li key={s.id} className="flex gap-2.5 text-sm">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: c }} />
                          <span>
                            <span className="font-medium text-white">{s.name}</span>
                            <span className="block text-xs text-[var(--gh-text-dim)]">{s.role}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <div className="mt-8">
            <Link href="/agents" className="gh-btn gh-btn-ghost">
              Full agent roster <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
