import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { AgentTerminal } from "./agent-terminal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[780px]" />
      <div className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000,transparent)]" />
      <div className="container-page relative pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
        <p className="reveal reveal-1 chip chip-mint mx-auto mb-7">
          <span className="gh-pulse size-1.5 rounded-full bg-[var(--mint)]" />
          Eight agents online
        </p>
        <h1 className="reveal reveal-2 h-display mx-auto max-w-4xl text-[2.6rem] sm:text-6xl lg:text-[4.75rem]">
          Describe it. <span className="text-[var(--mint)]">Ghost ships it.</span>
        </h1>
        <p className="reveal reveal-3 mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
          Give Ghost AI a goal and a stack. A crew of eight specialist agents plans, builds, tests, secures and
          documents it, then hands you a reviewed project with every commit on the record.
        </p>
        <div className="reveal reveal-4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="btn btn-primary btn-lg w-full sm:w-auto">
            Get started <ArrowRight className="size-4" />
          </Link>
          <Link href="/demo" className="btn btn-secondary btn-lg w-full sm:w-auto">
            <PlayCircle className="size-4" /> Watch the demo
          </Link>
        </div>
        <p className="reveal reveal-5 mt-4 text-[0.8125rem] text-[var(--text-faint)]">No keys, no card. Runs locally with sample data.</p>

        <div className="reveal reveal-7 relative mx-auto mt-16 max-w-4xl sm:mt-20">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 h-40 rounded-full bg-[var(--mint)]/10 blur-3xl" />
          <div className="relative">
            <AgentTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
