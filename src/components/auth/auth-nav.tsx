"use client";

import { Suspense } from "react";
import Link from "next/link";
import { AUTH_ENABLED } from "@/components/auth-provider";

/** Header auth control. Clerk is required lazily so demo / static builds never bundle it. */
export function AuthNav() {
  if (AUTH_ENABLED) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ClerkNav } = require("./clerk-nav") as typeof import("./clerk-nav");
    return (
      <Suspense fallback={<span className="h-8 w-20 animate-pulse rounded-[10px] bg-white/10" aria-hidden />}>
        <ClerkNav />
      </Suspense>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="chip chip-blue">Demo mode</span>
      <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        Dashboard
      </Link>
    </div>
  );
}
