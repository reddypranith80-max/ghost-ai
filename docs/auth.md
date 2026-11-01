# Authentication (Clerk: email + GitHub)

Auth is optional. Without keys the app runs in **demo mode**: no sign-in, `/dashboard` is open, and `/sign-in` and `/sign-up` show an explainer with a "Continue in demo mode" button.

## Enable it
1. Create an app at https://dashboard.clerk.com (development instance is fine).
2. Copy **API keys** into `.env.local` (see `.env.example`):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
   ```
3. In Clerk: **Configure -> User & authentication -> Email, phone, username**: enable **Email address** (sign-up with email code or password).
4. **Configure -> SSO connections -> Add connection -> For all users -> GitHub**. Development instances use Clerk's shared OAuth credentials, so nothing else is needed. For production, create a GitHub OAuth App and paste its Client ID/Secret; the callback URL is shown in the Clerk form.
5. Restart `npm run dev`.

## Test flow
- Visit `/dashboard` signed out: redirected to `/sign-in`.
- Sign up with email (or "Continue with GitHub"), land on `/dashboard`.
- Header shows the user button; sign out returns to `/`.
- `POST/PATCH/DELETE /api/projects*` return 401 without a session; `GET /api/health` and GET reads stay public.

## How it works
- `src/components/auth-provider.tsx`: `AUTH_ENABLED` = publishable key present and `NEXT_PUBLIC_DEMO !== "1"`. Clerk is `require()`d lazily so it is never bundled when disabled.
- `src/proxy.ts`: `clerkMiddleware` only when enabled; protects `/dashboard(.*)` and non-GET `/api/projects(.*)`.
- `src/lib/auth.ts`: `getUserId()` for route handlers (null in demo mode).
- `src/components/auth/*`: `AuthNav` (header), `AuthShell` (split-screen pages), dark/cyan/violet theme via `appearance.variables`.
- Static GitHub Pages build (`NEXT_PUBLIC_DEMO=1`): the proxy is moved aside, Clerk is excluded, and the auth pages export as the explainer.

## Troubleshooting
- Blank/erroring sign-in: key typo, or the key's instance domain is unreachable; check the browser console.
- Redirect loop: make sure `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and the proxy matcher is unchanged.
- GitHub button missing: the connection is not enabled in the Clerk dashboard.
- Keys set but still demo: `NEXT_PUBLIC_DEMO=1` is set, or the dev server was not restarted.
