"use client";

import { useEffect } from "react";

/**
 * Clerk's Next provider runs `invalidateCacheAction()` (a server action) before every sign-in/sign-up
 * `setActive`, and only continues when it resolves. If that action throws, the flow hangs forever
 * (sign-up verified, but the user is never redirected to the dashboard).
 *
 * We replace the hook with one that always resolves. Clerk's own `__internal_onAfterSetActive`
 * still calls `router.refresh()`, which re-renders server state with the new session.
 * Runs in useEffect so it executes after the provider's layout effect that installs the original hook.
 */
export function ClerkActionGuard() {
  useEffect(() => {
    const w = window as unknown as { __internal_onBeforeSetActive?: (intent?: string) => Promise<void> };
    w.__internal_onBeforeSetActive = () => Promise.resolve();
  }, []);
  return null;
}
