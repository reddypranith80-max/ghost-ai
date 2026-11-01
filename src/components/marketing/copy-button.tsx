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
      className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--text)] active:scale-95"
      aria-label={`${label} snippet`}
    >
      {done ? <Check className="size-3.5 text-[var(--mint)]" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}

export function Code({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--r-card)] bg-[#0c0e11] shadow-[var(--inner-top),0_0_0_1px_var(--hairline)]">
      <div className="flex items-center justify-between bg-white/[0.03] py-1.5 pl-4 pr-2">
        <span className="text-xs font-medium text-[var(--text-faint)]">{title ?? "snippet"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-[1.7] text-[#cfd5df]"><code>{code}</code></pre>
    </div>
  );
}
