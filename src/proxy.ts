import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const isDashboard = (p: string) => p === "/dashboard" || p.startsWith("/dashboard/");
const isProjectsApi = (p: string) => p === "/api/projects" || p.startsWith("/api/projects/");

const clerk = clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;
    if (isDashboard(pathname)) {
      await auth.protect(); // unauthenticated users go to signInUrl below
      return;
    }
    // Reads (GET/HEAD) and /api/health stay public; writes need a session.
    if (isProjectsApi(pathname) && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

// Clerk only with keys and outside the static demo; otherwise pass through (demo mode).
const enabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_DEMO !== "1";

export default enabled ? clerk : (req: NextRequest) => NextResponse.next({ request: req });

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
