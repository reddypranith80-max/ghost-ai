"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { Reveal, SectionHead } from "./reveal";

export function Crew() {
  const [open, setOpen] = useState<string | null>("Architect");
  return (
    <section className="relative">
      <div className="container-page section">
        <Reveal>
          <SectionHead
            tag="The crew"
            title="Eight leads. Twenty-four sidekicks."
            sub="Each lead owns a stage of the pipeline and delegates focused chores to its sub-agents. Tap a card to meet the team."
          />
        </Reveal>
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_CATALOG.map((a, i) => {
            const c = `var(--agent-${a.color})`;
            const isOpen = open === a.name;
            return (
              <Reveal key={a.name} delay={(i % 4) * 0.05}>
                <div
                  className={`surface card-lift overflow-hidden transition-colors ${isOpen ? "bg-[var(--surface-2)]" : ""}`}
                  style={isOpen ? { boxShadow: `var(--inner-top), 0 0 0 1px color-mix(in srgb, ${c} 35%, transparent), var(--shadow-1)` } : undefined}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : a.name)}
                    className="flex w-full flex-col rounded-[16px] p-5 text-left outline-offset-[-2px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                        <span className="size-2 rounded-full" style={{ background: c }} />
                        {a.codename}
                      </span>
                      <ChevronDown className={`size-4 text-[var(--text-faint)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-[var(--text)]">{a.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{a.tagline}</p>
                  </button>
                  {isOpen && (
                    <ul className="space-y-3 px-5 pb-5">
                      {a.subAgents.map((s) => (
                        <li key={s.id} className="flex gap-2.5 text-sm">
                          <span className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ background: c, opacity: 0.8 }} />
                          <span>
                            <span className="font-medium text-[var(--text)]">{s.name}</span>
                            <span className="block text-[0.8125rem] leading-snug text-[var(--text-muted)]">{s.role}</span>
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
          <div className="mt-10">
            <Link href="/agents" className="btn btn-secondary">
              Full agent roster <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
