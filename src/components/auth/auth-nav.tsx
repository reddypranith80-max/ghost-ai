"use client";

import Link from "next/link";
import { AUTH_ENABLED } from "@/components/auth-provider";

/** Header auth control. Clerk is required lazily so demo / static builds never bundle it. */
export function AuthNav() {
  if (AUTH_ENABLED) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ClerkNav } = require("./clerk-nav") as typeof import("./clerk-nav");
    return <ClerkNav />;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs font-medium text-violet-200">
        Demo mode
      </span>
      <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        Dashboard
      </Link>
    </div>
  );
}
