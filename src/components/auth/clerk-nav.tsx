"use client";

import Link from "next/link";

export function ClerkNav() {
  // Same lazy-require path as AuthProvider/ClerkForm so all share one Clerk module instance (context).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Show, UserButton } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <Link href="/sign-in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-[#22e5ff] px-3 py-1 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Get started
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <UserButton />
      </Show>
    </div>
  );
}
