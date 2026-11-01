import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, GitBranch, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AUTH_ENABLED } from "@/components/auth-provider";
import { ClerkForm } from "./clerk-form";

const FEED = [
  { who: "Planner", msg: "Split issue #214 into 4 tasks", c: "#22e5ff" },
  { who: "Coder", msg: "Opened PR: fix flaky retry logic", c: "#a06bff" },
  { who: "Reviewer", msg: "Approved with 2 suggestions", c: "#22e5ff" },
  { who: "Tester", msg: "48 checks passed", c: "#a06bff" },
];

export function AuthShell({ mode }: { mode: "sign-in" | "sign-up" }) {
  const title = mode === "sign-in" ? "Welcome back" : "Create your account";
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[radial-gradient(ellipse_at_top_left,#22e5ff22,transparent_55%),radial-gradient(ellipse_at_bottom_right,#a06bff2a,transparent_55%)] p-10 lg:flex">
        <Link href="/"><Logo className="text-lg" /></Link>
        <div className="space-y-8">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight">A team of AI agents that ships while you sleep.</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><ShieldCheck className="size-4 text-[#22e5ff]" />Every change reviewed and tested before it lands</li>
            <li className="flex gap-2"><GitBranch className="size-4 text-[#a06bff]" />Works on your GitHub repos, PR by PR</li>
            <li className="flex gap-2"><Mail className="size-4 text-[#22e5ff]" />Sign in with email or GitHub</li>
          </ul>
          <div className="max-w-md space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs">
            {FEED.map((f) => (
              <div key={f.msg} className="flex gap-2">
                <span style={{ color: f.c }}>{f.who}</span>
                <span className="text-muted-foreground">{f.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Ghost.AI</p>
      </section>
      <section className="flex flex-col items-center justify-center gap-6 p-6">
        <Link href="/" className="lg:hidden"><Logo /></Link>
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
    <div className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-card p-6 shadow-[0_0_60px_-25px_#a06bff]">
      <div>
        <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs text-violet-200">Demo mode</span>
        <h1 className="mt-3 text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Authentication (email + GitHub) is powered by Clerk and is not configured here, so everything runs as a local demo.
        </p>
      </div>
      <ol className="space-y-2 text-sm">
        <li><b className="text-[#22e5ff]">1.</b> Create a free app at clerk.com and enable Email and GitHub.</li>
        <li><b className="text-[#22e5ff]">2.</b> Put the keys in <code className="rounded bg-white/10 px-1">.env.local</code>: <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code className="rounded bg-white/10 px-1">CLERK_SECRET_KEY</code>.</li>
        <li><b className="text-[#22e5ff]">3.</b> Restart <code className="rounded bg-white/10 px-1">npm run dev</code>. See docs/auth.md.</li>
      </ol>
      <Link href="/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22e5ff] px-4 py-2 text-sm font-medium text-black hover:opacity-90">
        Continue in demo mode <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/** Shown while Clerk's form loads (Clerk renders in the browser, so Cache Components needs a Suspense boundary). */
function FormSkeleton() {
  return (
    <div role="status" aria-label="Loading sign-in form" className="w-full max-w-[400px] animate-pulse space-y-4 rounded-xl border border-white/10 bg-[#0b0b14] p-8">
      <div className="mx-auto h-6 w-40 rounded bg-white/10" />
      <div className="h-10 rounded bg-white/5" />
      <div className="h-10 rounded bg-white/5" />
      <div className="h-10 rounded bg-cyan-300/20" />
    </div>
  );
}
