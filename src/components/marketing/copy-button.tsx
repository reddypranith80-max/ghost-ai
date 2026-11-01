"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { setDone(false); }
      }}
      className="inline-flex items-center gap-1.5 rounded border border-[var(--gh-line)] bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
      aria-label={`${label} snippet`}
    >
      {done ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}

export function Code({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--gh-line)] bg-black/40">
      <div className="flex items-center justify-between border-b border-[var(--gh-line)] px-3 py-1.5">
        <span className="gh-hud">{title ?? "snippet"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-slate-200"><code>{code}</code></pre>
    </div>
  );
}
