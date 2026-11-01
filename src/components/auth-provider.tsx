/** Clerk is enabled only when keys exist and this isn't the static demo build; otherwise no auth (demo mode). */
export const AUTH_ENABLED =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_DEMO !== "1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!AUTH_ENABLED) return <>{children}</>;
  // Required lazily so the static demo build never bundles Clerk (it uses server actions).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return <ClerkProvider>{children}</ClerkProvider>;
}
