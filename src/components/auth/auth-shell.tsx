import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Download, GitBranch, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AUTH_ENABLED } from "@/components/auth-provider";
import { ClerkForm } from "./clerk-form";

const FEED = [
  { who: "Architect", msg: "Split the brief into 6 modules", c: "var(--agent-cyan)" },
  { who: "Backend", msg: "feat(api): projects routes", c: "var(--agent-violet)" },
  { who: "QA", msg: "e2e: 18 passed", c: "var(--agent-emerald)" },
  { who: "Reviewer", msg: "Verdict: Go", c: "var(--agent-lime)" },
];

const POINTS = [
  { icon: GitBranch, tone: "bg-[var(--mint-tint)] text-[var(--mint)]", t: "Eight agents, one pipeline", d: "Plan, build, test, secure and review, all visible." },
  { icon: ShieldCheck, tone: "bg-[var(--blue-tint)] text-[var(--blue)]", t: "A Go / No-Go on every build", d: "Nothing ships until the Reviewer signs off." },
  { icon: Download, tone: "bg-[var(--amber-tint)] text-[var(--amber)]", t: "Export what you built", d: "Take projects out as JSON or Markdown." },
];

export function AuthShell({ mode }: { mode: "sign-in" | "sign-up" }) {
  const title = mode === "sign-in" ? "Welcome back" : "Create your account";
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[var(--surface-1)] p-12 lg:flex xl:p-16">
        <div aria-hidden className="bg-atmosphere pointer-events-none absolute inset-0" />
        <div aria-hidden className="bg-dots fade-mask-b pointer-events-none absolute inset-0 opacity-25" />
        <Link href="/" className="relative w-fit"><Logo className="text-lg" /></Link>
        <div className="reveal relative space-y-10">
          <h2 className="h-display max-w-md text-4xl xl:text-[2.75rem]">A crew of AI agents that builds your SaaS.</h2>
          <ul className="max-w-md space-y-5">
            {POINTS.map(({ icon: I, tone, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-[12px] ${tone}`}><I className="size-5" /></span>
                <span><span className="block font-semibold text-[var(--text)]">{t}</span><span className="text-sm text-[var(--text-muted)]">{d}</span></span>
              </li>
            ))}
          </ul>
          <div aria-hidden className="max-w-md space-y-2.5 rounded-[16px] bg-black/30 p-5 text-[0.8rem] shadow-[var(--inner-top),0_0_0_1px_var(--hairline)]">
            {FEED.map((f) => (
              <div key={f.msg} className="flex items-center gap-3">
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: f.c }} />
                <span className="w-[4.75rem] shrink-0 font-medium" style={{ color: f.c }}>{f.who}</span>
                <span className="truncate text-[var(--text-muted)]">{f.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-[var(--text-faint)]">Ghost.AI</p>
      </section>
      <section className="relative flex flex-col items-center justify-center gap-8 px-6 py-12">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-72 w-96 rounded-full bg-[var(--mint)] opacity-[0.05] blur-[90px] lg:hidden" />
        <Link href="/" className="relative lg:hidden"><Logo /></Link>
        {AUTH_ENABLED ? (
          <Suspense fallback={<FormSkeleton />}>
            <ClerkForm mode={mode} />
          </Suspense>
        ) : (
          <Explainer title={title} />
        )}
      </section>
    </main>
  );
}

function Explainer({ title }: { title: string }) {
  return (
    <div className="surface-raised reveal reveal-1 w-full max-w-md space-y-6 p-7 sm:p-8">
      <div>
        <span className="chip chip-blue">Demo mode</span>
        <h1 className="h-display mt-4 text-2xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Authentication (email + GitHub) is powered by Clerk and is not configured here, so everything runs as a local demo.
        </p>
      </div>
      <ol className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
        <li className="flex gap-3"><b className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--mint-tint)] text-xs text-[var(--mint)]">1</b><span>Create a free app at clerk.com and enable Email and GitHub.</span></li>
        <li className="flex gap-3"><b className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--mint-tint)] text-xs text-[var(--mint)]">2</b><span>Put the keys in <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[var(--text)]">.env.local</code>: <code className="break-all rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[var(--text)]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[var(--text)]">CLERK_SECRET_KEY</code>.</span></li>
        <li className="flex gap-3"><b className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--mint-tint)] text-xs text-[var(--mint)]">3</b><span>Restart <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[var(--text)]">npm run dev</code>. See docs/auth.md.</span></li>
      </ol>
      <Link href="/dashboard" className="btn btn-primary btn-lg w-full">
        Continue in demo mode <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/** Shown while Clerk's form loads (Clerk renders in the browser, so Cache Components needs a Suspense boundary). */
function FormSkeleton() {
  return (
    <div role="status" aria-label="Loading sign-in form" className="surface-raised w-full max-w-[400px] animate-pulse space-y-4 p-8">
      <div className="mx-auto h-6 w-40 rounded-lg bg-white/10" />
      <div className="h-10 rounded-[12px] bg-white/5" />
      <div className="h-10 rounded-[12px] bg-white/5" />
      <div className="h-10 rounded-[12px] bg-[var(--mint)]/20" />
    </div>
  );
}
