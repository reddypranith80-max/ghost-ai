"use client";

import { useEffect, useState } from "react";
import { Check, GitBranch } from "lucide-react";

type Line = { who: string; agent: string; color: string; text: string };

const LINES: Line[] = [
  { who: "you", agent: "", color: "var(--text)", text: 'ghost new "Invoice tracker" --stack next,clerk,drizzle' },
  { who: "ATLAS", agent: "Architect", color: "var(--agent-cyan)", text: "Brief read. 3 modules, 14 tasks, 6 tables planned." },
  { who: "FORGE", agent: "Backend", color: "var(--agent-violet)", text: "a91f3c2  feat(db): invoices, clients, payments schema" },
  { who: "PRISM", agent: "Frontend", color: "var(--agent-fuchsia)", text: "5be07d1  feat(ui): invoice table and empty states" },
  { who: "HELM", agent: "DevOps", color: "var(--agent-amber)", text: "CI green. Preview deployed." },
  { who: "ECHO", agent: "QA", color: "var(--agent-emerald)", text: "42 tests passed, 0 failed." },
  { who: "AEGIS", agent: "Security", color: "var(--agent-rose)", text: "1 finding fixed: missing authz on /api/invoices/:id" },
  { who: "JUDGE", agent: "Reviewer", color: "var(--agent-lime)", text: "GO. Definition of done met." },
];

const ROSTER = LINES.slice(1);

export function AgentTerminal() {
  const [count, setCount] = useState(LINES.length);
  const [chars, setChars] = useState(9999);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = (line: number, ch: number) => {
      if (cancelled) return;
      setCount(line + 1);
      setChars(ch);
      const len = LINES[line].text.length;
      if (ch < len) timer = setTimeout(() => run(line, ch + 2), 16);
      else if (line + 1 < LINES.length) timer = setTimeout(() => run(line + 1, 0), 420);
      else
        timer = setTimeout(() => {
          setCount(0);
          timer = setTimeout(() => run(0, 0), 600);
        }, 6000);
    };
    timer = setTimeout(() => run(0, 0), 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const typingIdx = count > 0 && chars < LINES[count - 1].text.length ? count - 1 : -1;
  const finished = count >= LINES.length && typingIdx === -1;
  // roster index i corresponds to line i+1
  const doneAgents = ROSTER.filter((_, i) => i + 1 < count - 1 || (i + 1 === count - 1 && typingIdx === -1)).length;
  const pct = finished ? 100 : Math.round((doneAgents / ROSTER.length) * 100);

  return (
    <div className="surface-raised overflow-hidden rounded-[20px] text-left shadow-[0_40px_120px_-30px_rgba(62,230,160,0.18),var(--shadow-2)]">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 text-sm">
          <GitBranch className="size-4 shrink-0 text-[var(--text-faint)]" />
          <span className="truncate font-medium text-[var(--text)]">invoice-tracker</span>
          <span className="hidden text-[var(--text-faint)] sm:inline">run #12 (sample)</span>
        </div>
        <span className={`chip ${finished ? "chip-mint" : "chip-amber"}`}>
          <span className={`size-1.5 rounded-full ${finished ? "bg-[var(--mint)]" : "gh-pulse bg-[var(--amber)]"}`} />
          {finished ? "Shipped" : "Running"}
        </span>
      </div>

      <div className="grid md:grid-cols-[210px_1fr]">
        <ul className="hidden space-y-0.5 bg-black/20 p-3 md:block" aria-hidden>
          {ROSTER.map((a, i) => {
            const idx = i + 1;
            const done = idx < count - 1 || (idx === count - 1 && typingIdx === -1);
            const run = !done && idx === count - 1;
            return (
              <li key={a.who} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[0.8125rem]">
                <span
                  className={`size-2 shrink-0 rounded-full ${run ? "gh-pulse" : ""}`}
                  style={{ background: done || run ? a.color : "var(--surface-3)" }}
                />
                <span className={done || run ? "text-[var(--text)]" : "text-[var(--text-faint)]"}>{a.agent}</span>
                {done && <Check className="ml-auto size-3.5 text-[var(--mint)]" />}
              </li>
            );
          })}
        </ul>

        <div className="min-w-0 p-4 font-mono text-[0.75rem] leading-[1.7] sm:p-5 sm:text-[0.8125rem]">
          <div className="min-h-[15.5rem] space-y-1 sm:min-h-[16.5rem]">
            {LINES.map((l, i) => {
              if (i >= count) return null;
              const text = i === typingIdx ? l.text.slice(0, chars) : l.text;
              return (
                <p key={i} className="break-words">
                  <span style={{ color: l.color }} className="mr-2 font-semibold">
                    {l.who === "you" ? "$" : l.who.toLowerCase()}
                  </span>
                  <span className={l.who === "you" ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>{text}</span>
                  {i === typingIdx && <span className="gh-caret ml-0.5 inline-block h-3.5 w-[3px] translate-y-0.5 rounded-sm bg-[var(--mint)]" />}
                </p>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3 font-sans text-xs text-[var(--text-faint)]">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--amber)] to-[var(--mint)] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-9 text-right tabular-nums">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
