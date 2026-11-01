"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Rocket, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectInput } from "@/lib/contracts";
import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { fetchStack } from "@/lib/client-data";
import { STACK_SUGGESTIONS, agentHex } from "@/lib/sim";
import { useDash } from "./store";
import { field, hud } from "./kit";
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
          <DialogTitle className="font-display text-lg">New project</DialogTitle>
          <DialogDescription>Brief the crew. Eight agents plan, build, review and ship.</DialogDescription>
        </DialogHeader>
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span className={cn("flex size-6 items-center justify-center rounded-full border font-mono text-[11px]", i <= step ? "border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-[var(--acc)]" : "border-[var(--gh-line)] text-muted-foreground")}>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("text-xs", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < 2 && <span className="h-px flex-1 bg-[var(--gh-line)]" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="grid gap-3">
            <div className={hud}>Start from a template</div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.name} type="button" onClick={() => { setName(t.name); setBrief(t.brief); setStack(t.stack); }}
                  className="flex items-center gap-1 rounded-md border border-[var(--gh-line)] px-2 py-1 text-xs hover:border-[var(--acc)]/60 hover:bg-white/5">
                  <Sparkles className="size-3 text-[var(--acc)]" /> {t.name}
                </button>
              ))}
            </div>
            <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Project name" />
            <textarea placeholder="What should it do? Who is it for?" value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} className={field} aria-label="Brief" />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3">
            <div className={hud}>Suggested stack {stack.length ? `(${stack.length} selected)` : ""}</div>
            <div className="flex flex-wrap gap-1.5">
              {suggest.map((s) => (
                <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={stack.includes(s)}
                  className={cn("rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors", stack.includes(s) ? "border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_18%,transparent)] text-[var(--acc)]" : "border-[var(--gh-line)] text-muted-foreground hover:text-foreground")}>
                  {stack.includes(s) && <Check className="mr-1 inline size-3" />}{s}
                </button>
              ))}
              {stack.filter((s) => !suggest.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => toggle(s)} className="rounded-full border border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_18%,transparent)] px-2.5 py-1 font-mono text-[11px] text-[var(--acc)]">{s} x</button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addCustom(); }}>
              <Input placeholder="Add your own (e.g. Astro)" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Custom technology" />
              <button type="submit" className="gh-btn gh-btn-ghost !h-8">Add</button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <div className="rounded-md border border-[var(--gh-line)] bg-white/[0.03] p-3">
              <p className="font-display text-base font-medium">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{brief}</p>
              <div className="mt-2 flex flex-wrap gap-1">{stack.map((s) => <span key={s} className="rounded-sm border border-[var(--gh-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--acc)]">{s}</span>)}</div>
            </div>
            <div className={hud}>Agent plan preview</div>
            <ul className="grid grid-cols-2 gap-1.5">
              {AGENT_CATALOG.map((a, i) => (
                <li key={a.name} className="rounded-md border border-[var(--gh-line)] p-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase" style={{ color: agentHex(a.name) }}>
                    <span className="size-1.5 rounded-full" style={{ background: agentHex(a.name) }} /> {i + 1}. {a.codename}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{a.produces}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">+ {a.subAgents.length} side agents</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {err && <p className="text-xs text-destructive" role="alert">{err}</p>}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button type="button" onClick={() => { setErr(null); if (step) setStep(step - 1); else setNewOpen(false); }} className="gh-btn gh-btn-ghost !h-9">
            <ArrowLeft className="size-4" /> {step ? "Back" : "Cancel"}
          </button>
          {step < 2 ? (
            <button type="button" onClick={next} className="gh-btn gh-btn-primary !h-9">Next <ArrowRight className="size-4" /></button>
          ) : (
            <button type="button" onClick={launch} disabled={busy} className="gh-btn gh-btn-primary !h-9"><Rocket className="size-4" /> {busy ? "Launching..." : "Launch agents"}</button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
