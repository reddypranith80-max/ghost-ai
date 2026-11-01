import { useId } from "react";

const BODY = "M24 4 C14 4 8 11 8 20 V42 L14 37 L19 42 L24 37 L29 42 L34 37 L40 42 V20 C40 11 34 4 24 4Z";

/** Geometric ghost with circuit traces; cyan to violet gradient glow. */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22e5ff" />
          <stop offset="1" stopColor="#a06bff" />
        </linearGradient>
        <filter id={`f${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <path d={BODY} fill={`url(#g${id})`} opacity=".4" filter={`url(#f${id})`} />
      <path d={BODY} fill="#070a18" stroke={`url(#g${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 17 H19 L21 19 M34 17 H29 L27 19" stroke={`url(#g${id})`} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <rect x="15" y="20" width="6" height="6" rx="1.2" fill="#22e5ff" />
      <rect x="27" y="20" width="6" height="6" rx="1.2" fill="#a06bff" />
      <path d="M18 31 H22 V33 H26 V31 H30" stroke={`url(#g${id})`} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9.5" r="1.4" fill="#fff" />
    </svg>
  );
}

export function Logo({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${className}`}>
      <LogoMark size={size} />
      <span className="text-[1.05rem] leading-none">
        Ghost<span className="gh-text-gradient">.AI</span>
      </span>
    </span>
  );
}
