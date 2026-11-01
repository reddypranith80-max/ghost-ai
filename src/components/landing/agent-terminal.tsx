"use client";

import { useEffect, useState } from "react";

type Line = { who: string; color: string; text: string };

const LINES: Line[] = [
  { who: "you", color: "#e8ecff", text: 'ghost new "Invoice tracker for freelancers" --stack next,clerk,drizzle' },
  { who: "ATLAS", color: "#22e5ff", text: "Reading brief... 3 modules, 14 tasks, 6 tables planned." },
  { who: "FORGE", color: "#a06bff", text: "commit a91f3c2  feat(db): invoices, clients, payments schema" },
  { who: "PRISM", color: "#e879f9", text: "commit 5be07d1  feat(ui): invoice table + empty states" },
  { who: "HELM", color: "#fbbf24", text: "CI green. Preview deployed to ghost-invoices.vercel.app" },
  { who: "ECHO", color: "#34d399", text: "42 tests passed, 0 failed. Coverage 87%." },
  { who: "AEGIS", color: "#fb7185", text: "1 finding fixed: missing authz check on /api/invoices/:id" },
  { who: "JUDGE", color: "#a3e635", text: "GO. Definition of done met. Shipping." },
];

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
      if (line >= LINES.length) return;
      const len = LINES[line].text.length;
      if (ch < len) timer = setTimeout(() => run(line, ch + 2), 14);
      else if (line + 1 < LINES.length) timer = setTimeout(() => run(line + 1, 0), 380);
      else
        timer = setTimeout(() => {
          setCount(0);
          run(0, 0);
        }, 5000);
    };
    timer = setTimeout(() => run(0, 0), 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="gh-panel gh-corners relative overflow-hidden font-mono text-[0.72rem] leading-relaxed sm:text-xs">
      <div className="flex items-center justify-between border-b border-[var(--gh-line)] bg-white/[0.03] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-300/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="gh-hud !text-[0.6rem]">agent-terminal // live</span>
      </div>
      <div className="relative min-h-[17rem] space-y-1.5 p-4 sm:min-h-[19rem]">
        <div className="gh-scanbar" />
        {LINES.map((l, i) => {
          if (i >= count) return null;
          const text = i === count - 1 ? l.text.slice(0, chars) : l.text;
          return (
            <p key={i} className="break-words">
              <span style={{ color: l.color }} className="mr-2 font-semibold">
                {l.who === "you" ? "$" : `[${l.who}]`}
              </span>
              <span className="text-[#c9d1f5]">{text}</span>
              {i === count - 1 && <span className="gh-caret ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-[var(--gh-cyan)]" />}
            </p>
          );
        })}
      </div>
    </div>
  );
}
