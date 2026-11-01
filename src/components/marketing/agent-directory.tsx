"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { ACCENT, Panel, accentStyle, textLink } from "./ui";

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
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, sub-agents, tools..." className="h-12 w-full rounded-[var(--r-control)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text)] shadow-[var(--inner-top),0_0_0_1px_var(--hairline)] transition-shadow placeholder:text-[var(--text-faint)] focus:shadow-[0_0_0_2px_rgba(62,230,160,0.45)] focus:outline-none" />
        </label>
        <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          Tool
          <select value={tool} onChange={(e) => setTool(e.target.value)} className="h-12 rounded-[var(--r-control)] bg-[var(--surface-2)] px-4 text-sm text-[var(--text)] shadow-[var(--inner-top),0_0_0_1px_var(--hairline)] focus:shadow-[0_0_0_2px_rgba(62,230,160,0.45)] focus:outline-none">
            {tools.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <p className="mb-4 text-sm text-[var(--text-faint)]" aria-live="polite">{list.length} of {AGENT_CATALOG.length} lead agents shown</p>
      {list.length === 0 && <Panel><p className="text-sm text-[var(--text-muted)]">No agent matches that search. <button className={textLink} onClick={() => { setQ(""); setTool("All"); }}>Clear filters</button></p></Panel>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => {
          const isOpen = !!open[a.name];
          return (
            <div key={a.name} style={accentStyle(a.color)} className="surface card-lift relative overflow-hidden p-6">
              <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-[var(--a)] opacity-[0.07] blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className={`chip ${ACCENT.chip}`}><span className={`size-1.5 rounded-full ${ACCENT.dot}`} />{a.codename}</span>
                  <h3 className="mt-3 text-xl font-semibold text-[var(--text)]">{a.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{a.tagline}</p>
                </div>
                <Link href={`/agents/${a.name.toLowerCase()}`} className="btn btn-ghost btn-sm shrink-0 gap-1 !px-2.5">Details<ArrowUpRight className="size-3.5" /></Link>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-1.5">
                {a.tools.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
              <p className="relative mt-4 text-sm text-[var(--text)]"><span className="text-[var(--text-faint)]">Produces </span>{a.produces}</p>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [a.name]: !isOpen }))} className="relative mt-5 flex w-full items-center justify-between rounded-[10px] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-white/[0.06]">
                {a.subAgents.length} sub-agents
                <ChevronDown className={`size-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <ul className="relative mt-2 space-y-1.5">
                  {a.subAgents.map((s) => (
                    <li key={s.id} className="rounded-[10px] bg-black/20 px-3.5 py-2.5 text-sm">
                      <span className="font-medium text-[var(--text)]">{s.name}</span>
                      <span className="block text-xs text-[var(--text-muted)]">{s.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
