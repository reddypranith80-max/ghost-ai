"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { COLOR, Panel } from "./ui";

export function AgentDirectory() {
  const [q, setQ] = useState("");
  const [tool, setTool] = useState("All");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const tools = useMemo(() => ["All", ...Array.from(new Set(AGENT_CATALOG.flatMap((a) => a.tools))).sort()], []);
  const list = AGENT_CATALOG.filter((a) => {
    const hay = [a.name, a.codename, a.tagline, a.produces, ...a.tools, ...a.subAgents.flatMap((s) => [s.name, s.role])].join(" ").toLowerCase();
    return hay.includes(q.trim().toLowerCase()) && (tool === "All" || a.tools.includes(tool));
  });
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search agents</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--gh-text-dim)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, sub-agents, tools..." className="w-full rounded-md border border-[var(--gh-line)] bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[var(--gh-text-dim)] focus:outline-2 focus:outline-cyan-300" />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--gh-text-dim)]">
          Tool
          <select value={tool} onChange={(e) => setTool(e.target.value)} className="rounded-md border border-[var(--gh-line)] bg-[#0e1224] px-3 py-2.5 text-sm text-white">
            {tools.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <p className="mb-3 text-xs text-[var(--gh-text-dim)]" aria-live="polite">{list.length} of {AGENT_CATALOG.length} lead agents shown</p>
      {list.length === 0 && <Panel><p className="text-sm text-[var(--gh-text-dim)]">No agent matches that search. <button className="text-cyan-300 underline" onClick={() => { setQ(""); setTool("All"); }}>Clear filters</button></p></Panel>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => {
          const c = COLOR[a.color];
          const isOpen = !!open[a.name];
          return (
            <Panel key={a.name}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`gh-hud ${c.text}`}>{a.codename}</p>
                  <h3 className="text-lg font-semibold text-white">{a.name}</h3>
                  <p className="text-sm text-[var(--gh-text-dim)]">{a.tagline}</p>
                </div>
                <Link href={`/agents/${a.name.toLowerCase()}`} className="shrink-0 text-xs text-cyan-300 underline">Details</Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.tools.map((t) => <span key={t} className={`rounded border px-2 py-0.5 text-xs ${c.ring} ${c.bg} ${c.text}`}>{t}</span>)}
              </div>
              <p className="mt-3 text-sm text-white/80"><span className="text-[var(--gh-text-dim)]">Produces: </span>{a.produces}</p>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [a.name]: !isOpen }))} className="mt-3 flex w-full items-center justify-between border-t border-[var(--gh-line)] pt-3 text-sm text-white">
                {a.subAgents.length} sub-agents
                <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <ul className="mt-2 space-y-2">
                  {a.subAgents.map((s) => (
                    <li key={s.id} className="rounded border border-[var(--gh-line)] bg-black/20 px-3 py-2 text-sm">
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="block text-xs text-[var(--gh-text-dim)]">{s.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
