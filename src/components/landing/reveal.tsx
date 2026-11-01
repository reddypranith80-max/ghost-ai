"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal that is VISIBLE by default (SSR / no-JS / screenshots).
 * After mount, elements that are below the fold get hidden and fade in when they enter the viewport.
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: state === "hidden" ? 0.01 : 1,
        transform: state === "hidden" ? "translateY(22px)" : "none",
        transition: state === "ssr" ? "none" : `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}s`,
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
  return (
    <div className={`mb-10 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="gh-hud mb-3 flex items-center gap-2" style={{ justifyContent: align === "center" ? "center" : "flex-start" }}>
        <span className="gh-ticks w-8" />
        {tag}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-[var(--gh-text-dim)]">{sub}</p>}
    </div>
  );
}

export function Rivets() {
  return (
    <>
      <span className="gh-rivet absolute left-3 top-2" />
      <span className="gh-rivet absolute right-6 top-2" />
    </>
  );
}
