"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Rocket, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectInput } from "@/lib/contracts";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { fetchStack } from "@/lib/client-data";
import { STACK_SUGGESTIONS } from "@/lib/sim";
import { useDash } from "./store";
import { agentColor, cap, field, lbl } from "./kit";
import { cn } from "cn";

const TEMPLATES = [
  { name: "Invoice Hub", brief: "Invoicing app with clients, recurring bills and PDF receipts.", stack: ["Next.js", "Postgres", "Stripe", "Clerk"] },
  { name: "Pulse Status", brief: "Public status page with incident timeline and email alerts.", stack: ["Next.js", "SQLite", "Resend", "Tailwind"] },
  { name: "Trailblaze LMS", brief: "Course platform with lessons, quizzes and progress tracking.", stack: ["Next.js", "Supabase", "shadcn/ui"] },
];

export function NewProjectWizard() {
  const { newOpen, setNewOpen, createProject } = useDash();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [suggest, setSuggest] = useState<string[]>(STACK_SUGGESTIONS);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!newOpen) return;
    fetchStack().then((s) => s && setSuggest([...new Set([...s, ...STACK_SUGGESTIONS])]));
  }, [newOpen]);

  const reset = () => { setStep(0); setName(""); setBrief(""); setStack([]); setCustom(""); setErr(null); };
  const toggle = (s: string) => setStack((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]));
  const addCustom = () => { const v = custom.trim(); if (v && !stack.includes(v)) setStack((l) => [...l, v]); setCustom(""); };

  function next() {
    if (step === 0 && (name.trim().length < 2 || brief.trim().length < 10)) {
      setErr("Give it a name (2+ chars) and a brief of at least 10 characters.");
      return;
    }
    if (step === 1 && !stack.length) {
      setErr("Pick at least one technology.");
      return;
    }
    setErr(null);
    setStep((s) => s + 1);
  }

  async function launch() {
    const parsed = ProjectInput.safeParse({ name: name.trim(), brief: brief.trim(), stack });
    if (!parsed.success) { setErr("Please check the details."); return; }
    setBusy(true);
    try {
      await createProject(parsed.data);
      setNewOpen(false);
      reset();
      router.push("/dashboard");
    } catch {
      setErr("Could not create project.");
    } finally {
      setBusy(false);
    }
  }

  const steps = ["Brief", "Stack", "Review"];
  return (
    <Dialog open={newOpen} onOpenChange={(o) => { setNewOpen(o); if (!o) reset(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New project</DialogTitle>
          <DialogDescription>Brief the crew. Eight agents plan, build, review and ship.</DialogDescription>
        </DialogHeader>
        <ol className="flex items-center gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2.5 last:flex-none">
              <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200", i < step ? "bg-[var(--mint)] text-[var(--mint-ink)]" : i === step ? "bg-[var(--mint-tint)] text-[var(--mint)] shadow-[0_0_0_1.5px_rgba(62,230,160,0.5)]" : "bg-white/[0.06] text-[var(--text-faint)]")}>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("text-[13px] font-medium", i === step ? "text-foreground" : "text-[var(--text-faint)]")}>{s}</span>
              {i < 2 && <span className={cn("h-px flex-1 rounded transition-colors duration-300", i < step ? "bg-[var(--mint)]/50" : "bg-white/[0.08]")} />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="grid gap-4">
            <div className="grid gap-2.5">
              <div className={lbl}>Start from a template</div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.name} type="button" onClick={() => { setName(t.name); setBrief(t.brief); setStack(t.stack); }}
                    className="flex h-9 items-center gap-2 rounded-xl bg-white/[0.045] px-3 text-[13px] font-medium transition-[background,transform] duration-150 hover:-translate-y-0.5 hover:bg-white/[0.09] active:scale-[0.98]">
                    <Sparkles className="size-3.5 text-[var(--mint)]" /> {t.name}
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Project name" />
            <textarea placeholder="What should it do? Who is it for?" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} className={cn(field, "resize-none leading-relaxed")} aria-label="Brief" />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div className={lbl}>Suggested stack {stack.length ? `(${stack.length} selected)` : ""}</div>
            <div className="flex flex-wrap gap-2">
              {suggest.map((s) => (
                <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={stack.includes(s)}
                  className={cn("flex h-8 items-center rounded-full px-3 text-[13px] font-medium transition-[background,color,transform] duration-150 active:scale-[0.97]", stack.includes(s) ? "bg-[var(--mint-tint)] text-[var(--mint)] shadow-[0_0_0_1px_rgba(62,230,160,0.35)]" : "bg-white/[0.05] text-[var(--text-muted)] hover:bg-white/[0.09] hover:text-foreground")}>
                  {stack.includes(s) && <Check className="mr-1.5 size-3.5" />}{s}
                </button>
              ))}
              {stack.filter((s) => !suggest.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => toggle(s)} className="flex h-8 items-center rounded-full bg-[var(--mint-tint)] px-3 text-[13px] font-medium text-[var(--mint)] shadow-[0_0_0_1px_rgba(62,230,160,0.35)]">{s} x</button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addCustom(); }}>
              <Input placeholder="Add your own (e.g. Astro)" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Custom technology" />
              <button type="submit" className="btn btn-secondary">Add</button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-white/[0.04] p-4">
              <p className="font-display text-lg font-semibold tracking-tight">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{brief}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
            <div className={lbl}>Agent plan preview</div>
            <ul className="grid grid-cols-2 gap-2">
              {AGENT_CATALOG.map((a, i) => (
                <li key={a.name} className="rounded-xl bg-white/[0.03] p-3 text-xs">
                  <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: agentColor(a.name) }}>
                    <span className="size-1.5 rounded-full" style={{ background: agentColor(a.name) }} /> {i + 1}. {cap(a.codename)}
                  </div>
                  <p className="mt-1 leading-snug text-[var(--text-muted)]">{a.produces}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-faint)]">+ {a.subAgents.length} side agents</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {err && <p className="text-[13px] text-[var(--coral)]" role="alert">{err}</p>}
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => { setErr(null); if (step) setStep(step - 1); else setNewOpen(false); }} className="btn btn-ghost">
            <ArrowLeft className="size-4" /> {step ? "Back" : "Cancel"}
          </button>
          {step < 2 ? (
            <button type="button" onClick={next} className="btn btn-primary">Next <ArrowRight className="size-4" /></button>
          ) : (
            <button type="button" onClick={launch} disabled={busy} className="btn btn-primary disabled:opacity-70"><Rocket className="size-4" /> {busy ? "Launching..." : "Launch agents"}</button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
