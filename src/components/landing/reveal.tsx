"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal that is VISIBLE by default (SSR / no-JS / screenshots).
 * After mount, elements below the fold are hidden and fade in as they enter the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ssr" | "hidden" | "shown">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = el.getBoundingClientRect();
    if (reduce || typeof IntersectionObserver === "undefined" || r.top < window.innerHeight * 0.95) {
      setState("shown");
      return;
    }
    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: state === "hidden" ? 0.001 : 1,
        transform: state === "hidden" ? "translateY(14px)" : "none",
        transition: state === "ssr" ? "none" : `opacity .6s var(--ease) ${delay}s, transform .6s var(--ease) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  tag,
  title,
  sub,
  align = "left",
}: {
  tag: string;
  title: React.ReactNode;
  sub?: string;
  align?: "left" | "center";
}) {
  const c = align === "center";
  return (
    <div className={`mb-12 max-w-2xl sm:mb-14 ${c ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow mb-4">{tag}</p>
      <h2 className="text-balance text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--text)] sm:text-[2.6rem]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)] sm:text-[1.0625rem]">{sub}</p>}
    </div>
  );
}

export const Mint = ({ children }: { children: React.ReactNode }) => <span className="text-[var(--mint)]">{children}</span>;
