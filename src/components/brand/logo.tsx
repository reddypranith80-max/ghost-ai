import { useId } from "react";

const BODY =
  "M24 4C14.6 4 8 10.8 8 20v20.5c0 1.4 1.6 2.1 2.6 1.2l3.7-3.4a1.6 1.6 0 0 1 2.2 0l2.7 2.5a1.6 1.6 0 0 0 2.2 0L24 40l2.6 2.8a1.6 1.6 0 0 0 2.2 0l2.7-2.5a1.6 1.6 0 0 1 2.2 0l3.7 3.4c1 .9 2.6.2 2.6-1.2V20C40 10.8 33.4 4 24 4Z";

/** Geometric ghost: solid signal-mint body, two ink eyes. Reads at 16px. */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ff5bd" />
          <stop offset="1" stopColor="#3ee6a0" />
        </linearGradient>
      </defs>
      <path d={BODY} fill={`url(#g${id})`} />
      <ellipse cx="18" cy="21" rx="2.8" ry="3.6" fill="#0a0b0d" />
      <ellipse cx="30" cy="21" rx="2.8" ry="3.6" fill="#0a0b0d" />
    </svg>
  );
}

export function Logo({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display font-bold tracking-tight ${className}`}>
      <LogoMark size={size} />
      <span className="text-[1.1rem] leading-none tracking-[-0.03em]">
        Ghost<span className="text-[var(--mint)]">.AI</span>
      </span>
    </span>
  );
}
