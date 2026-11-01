"use client";
import { motion, useReducedMotion } from "framer-motion";

type N = { id: string; label: string; x: number; y: number; c: string };
const NODES: N[] = [
  { id: "a", label: "ARCHITECT", x: 70, y: 150, c: "#22e5ff" },
  { id: "b", label: "BACKEND", x: 250, y: 70, c: "#22e5ff" },
  { id: "f", label: "FRONTEND", x: 250, y: 230, c: "#a06bff" },
  { id: "d", label: "DEVOPS", x: 430, y: 70, c: "#22e5ff" },
  { id: "q", label: "QA", x: 430, y: 230, c: "#a06bff" },
  { id: "s", label: "SECURITY", x: 610, y: 150, c: "#22e5ff" },
  { id: "r", label: "REVIEWER", x: 790, y: 150, c: "#a06bff" },
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

export function PipelineDiagram() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 860 300"
      role="img"
      aria-label="Agent pipeline: Architect to Backend and Frontend, then DevOps and QA, Security, Reviewer"
      className="h-auto w-full"
    >
      {EDGES.map(([from, to], i) => {
        const a = get(from);
        const b = get(to);
        const mx = (a.x + b.x) / 2;
        const d = `M${a.x + 50} ${a.y} C ${mx + 20} ${a.y}, ${mx - 20} ${b.y}, ${b.x - 50} ${b.y}`;
        return (
          <g key={i}>
            <motion.path
              d={d}
              fill="none"
              stroke="rgba(120,160,255,.35)"
              strokeWidth={1.5}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.12 }}
            />
            <path d={d} fill="none" stroke="#22e5ff" strokeWidth={1.5} className="gh-flow" opacity={0.8} />
          </g>
        );
      })}
      {NODES.map((n, i) => (
        <motion.g
          key={n.id}
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <polygon
            points={`${n.x - 50},${n.y - 14} ${n.x - 40},${n.y - 24} ${n.x + 50},${n.y - 24} ${n.x + 50},${n.y + 14} ${n.x + 40},${n.y + 24} ${n.x - 50},${n.y + 24}`}
            fill="#0a0e1f"
            stroke={n.c}
            strokeWidth={1.4}
          />
          <circle cx={n.x - 42} cy={n.y} r={2.5} fill={n.c}>
            {!reduce && (
              <animate attributeName="opacity" values="1;.3;1" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            )}
          </circle>
          <text
            x={n.x + 4}
            y={n.y + 4}
            textAnchor="middle"
            fill="#e8ecff"
            fontSize="11"
            letterSpacing="1.5"
            fontFamily="var(--font-code), monospace"
          >
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
