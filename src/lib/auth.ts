import { AUTH_ENABLED } from "@/components/auth-provider";

/** Current Clerk user id, or null when signed out or Clerk is disabled (demo mode). Clerk is loaded lazily. */
export async function getUserId(): Promise<string | null> {
  if (!AUTH_ENABLED) return null;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId ?? null;
}
