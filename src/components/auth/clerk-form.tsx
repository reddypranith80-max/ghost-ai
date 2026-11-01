"use client";

import { AUTH_ENABLED } from "@/components/auth-provider";
import { clerkAppearance } from "./appearance";

/** Renders Clerk's <SignIn/> or <SignUp/> (email + GitHub, per dashboard config). Lazy so static builds exclude Clerk. */
export function ClerkForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  if (!AUTH_ENABLED) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return mode === "sign-in" ? (
    <clerk.SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />
  ) : (
    <clerk.SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />
  );
}
