"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal, SectionHead } from "./reveal";

type S = "done" | "run" | "wait";
type N = { id: string; label: string; code: string; x: number; y: number; c: string; s: S };

const W = 150;
const H = 54;
const NODES: N[] = [
  { id: "a", label: "Architect", code: "ATLAS", x: 85, y: 140, c: "var(--agent-cyan)", s: "done" },
  { id: "b", label: "Backend", code: "FORGE", x: 265, y: 60, c: "var(--agent-violet)", s: "done" },
  { id: "f", label: "Frontend", code: "PRISM", x: 265, y: 220, c: "var(--agent-fuchsia)", s: "done" },
  { id: "d", label: "DevOps", code: "HELM", x: 445, y: 60, c: "var(--agent-amber)", s: "done" },
  { id: "q", label: "QA", code: "ECHO", x: 445, y: 220, c: "var(--agent-emerald)", s: "done" },
  { id: "s", label: "Security", code: "AEGIS", x: 625, y: 140, c: "var(--agent-rose)", s: "run" },
  { id: "r", label: "Reviewer", code: "JUDGE", x: 805, y: 140, c: "var(--agent-lime)", s: "wait" },
];
const EDGES: [string, string][] = [
  ["a", "b"],
  ["a", "f"],
  ["b", "d"],
  ["f", "q"],
  ["d", "s"],
  ["q", "s"],
  ["s", "r"],
];
const get = (id: string) => NODES.find((n) => n.id === id)!;

function PipelineSvg() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 890 280"
      role="img"
      aria-label="Agent pipeline: Architect to Backend and Frontend, then DevOps and QA, Security, Reviewer"
      className="h-auto w-full"
    >
      {EDGES.map(([from, to], i) => {
        const a = get(from);
        const b = get(to);
        const x1 = a.x + W / 2;
        const x2 = b.x - W / 2;
        const mx = (x1 + x2) / 2;
        const d = `M${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`;
        const active = b.s === "wait";
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeLinecap="round" />
            <motion.path
              d={d}
              fill="none"
              stroke={active ? "var(--amber)" : "var(--mint)"}
              strokeOpacity={active ? 0.9 : 0.55}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={active ? "3 7" : undefined}
              className={active ? "gh-flow" : undefined}
              initial={reduce || active ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </g>
        );
      })}
      {NODES.map((n, i) => (
        <motion.g
          key={n.id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {n.s === "run" && <rect x={n.x - W / 2 - 4} y={n.y - H / 2 - 4} width={W + 8} height={H + 8} rx={18} fill="none" stroke="var(--amber)" strokeOpacity={0.35} strokeWidth={1.5} />}
          <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={14} fill="#161a20" stroke="rgba(255,255,255,0.08)" />
          <circle cx={n.x - W / 2 + 22} cy={n.y} r={5} fill={n.c} opacity={n.s === "wait" ? 0.45 : 1} />
          <text x={n.x - W / 2 + 38} y={n.y - 3} fill="#eceef2" fontSize="14" fontWeight="600" fontFamily="var(--font-grotesk), sans-serif">
            {n.label}
          </text>
          <text x={n.x - W / 2 + 38} y={n.y + 14} fill="#6b7280" fontSize="10.5" fontFamily="var(--font-code), monospace">
            {n.code}
          </text>
          {n.s === "done" && (
            <g transform={`translate(${n.x + W / 2 - 24}, ${n.y - 8})`}>
              <circle cx="8" cy="8" r="8" fill="rgba(62,230,160,0.14)" />
              <path d="M4.6 8.2l2.4 2.3 4.4-4.6" fill="none" stroke="var(--mint)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {n.s === "run" && (
            <circle cx={n.x + W / 2 - 16} cy={n.y} r={4} fill="var(--amber)">
              {!reduce && <animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite" />}
            </circle>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

const STAGES: { label: string; code: string; c: string; s: S }[] = [
  { label: "Architect", code: "ATLAS", c: "var(--agent-cyan)", s: "done" },
  { label: "Backend + Frontend", code: "FORGE, PRISM", c: "var(--agent-violet)", s: "done" },
  { label: "DevOps + QA", code: "HELM, ECHO", c: "var(--agent-amber)", s: "done" },
  { label: "Security", code: "AEGIS", c: "var(--agent-rose)", s: "run" },
  { label: "Reviewer", code: "JUDGE", c: "var(--agent-lime)", s: "wait" },
];

function PipelineList() {
  return (
    <ol className="relative space-y-3 pl-1" aria-label="Pipeline stages">
      {STAGES.map((s, i) => (
        <li key={s.label} className="relative flex items-center gap-4 rounded-[12px] bg-[var(--surface-2)] px-4 py-3.5">
          {i < STAGES.length - 1 && (
            <span className="absolute left-[1.45rem] top-full h-3 w-px" style={{ background: s.s === "wait" ? "var(--hairline)" : "var(--mint)", opacity: 0.5 }} />
          )}
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.c, opacity: s.s === "wait" ? 0.45 : 1 }} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--text)]">{s.label}</span>
            <span className="block font-mono text-[0.7rem] text-[var(--text-faint)]">{s.code}</span>
          </span>
          <span className={`chip ${s.s === "done" ? "chip-mint" : s.s === "run" ? "chip-amber" : ""}`}>
            {s.s === "done" ? "Done" : s.s === "run" ? "Running" : "Queued"}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PipelineSection() {
  return (
    <section className="relative">
      <div className="container-page section">
        <Reveal>
          <SectionHead
            tag="The pipeline"
            title="Seven agents in a single, ordered flow."
            sub="Work fans out after planning, converges at the security gate, and only ships when the Reviewer says go. The sample below is a run in progress."
          />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="surface rounded-[20px] p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--text)]">Sample run</span>
              <span className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[var(--mint)]" />Done</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[var(--amber)]" />Running</span>
                <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-white/25" />Queued</span>
              </span>
            </div>
            <div className="hidden md:block">
              <PipelineSvg />
            </div>
            <div className="md:hidden">
              <PipelineList />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
