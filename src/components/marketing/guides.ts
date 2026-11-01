export type Guide = { slug: string; title: string; desc: string; time: string; sections: { h: string; p: string; code?: string }[] };

export const GUIDES: Guide[] = [
  { slug: "quick-start", title: "Quick start", desc: "Run Ghost AI locally and create your first project.", time: "5 min", sections: [
    { h: "Install", p: "You need Node 22 or newer. Clone the repo, enter the web folder and install dependencies.", code: "cd web\nnpm install" },
    { h: "Configure", p: "Copy the example environment file. Without Clerk keys the app runs in demo mode with mock data, which is perfect for a first look.", code: "cp .env.example .env.local" },
    { h: "Run", p: "Start the dev server and open the dashboard.", code: "npm run dev\n# open http://localhost:3000/dashboard" },
    { h: "Create a project", p: "Click New project, write a brief (at least 10 characters), choose a stack and watch the agents pick up tasks." },
    { h: "Verify", p: "Call the health endpoint to confirm the API is up.", code: "curl http://localhost:3000/api/health" },
  ] },
  { slug: "architecture", title: "Architecture", desc: "Layers, data model and how the agent pipeline is wired.", time: "8 min", sections: [
    { h: "Layers", p: "UI (App Router, shadcn/ui, framer-motion) calls API route handlers, which validate with Zod and call services backed by Drizzle and libSQL." },
    { h: "Data model", p: "Three tables: projects, tasks and gitlogs. Tasks and gitlogs reference a project by id." },
    { h: "Agent pipeline", p: "Architect fans out to Backend and Frontend, which feed DevOps and QA, then Security and finally the Reviewer. Docs runs alongside." },
    { h: "Contracts", p: "src/lib/contracts.ts is the single source of truth for types and Zod schemas shared by UI and API." },
    { h: "Demo mode", p: "Without a database the app falls back to mock data so the static GitHub Pages demo always works." },
  ] },
  { slug: "agents", title: "Agents guide", desc: "How lead agents and side agents are defined and scheduled.", time: "6 min", sections: [
    { h: "The catalog", p: "src/lib/agent-catalog.ts lists the eight lead agents. Each has a codename, tools, outputs and three sub-agents." },
    { h: "Status", p: "An agent is idle, working or done. While working it exposes its current task." },
    { h: "Adding an agent", p: "Add a name to the AGENTS tuple in contracts.ts, then an entry in the catalog. The directory page picks it up automatically." },
    { h: "Hand-offs", p: "Agents never talk through free text. They exchange tasks, contracts and commits." },
  ] },
  { slug: "api", title: "API overview", desc: "Conventions for the 13 JSON endpoints.", time: "4 min", sections: [
    { h: "Base URL", p: "All routes live under /api and return JSON." },
    { h: "Errors", p: "Validation failures return 400 with an issues array. Unknown ids return 404." },
    { h: "Full reference", p: "See the API reference page for curl examples, sample responses and live Try it buttons." },
  ] },
  { slug: "auth", title: "Auth", desc: "Clerk sessions, roles and demo mode.", time: "5 min", sections: [
    { h: "Clerk", p: "Sign-in, sessions and user management are handled by Clerk. Add your publishable and secret keys to enable it.", code: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...\nCLERK_SECRET_KEY=sk_test_..." },
    { h: "Protected routes", p: "The dashboard and project APIs check the session on the server before returning data." },
    { h: "Demo mode", p: "If keys are missing the auth provider is skipped so visitors can explore without signing up." },
    { h: "Roles", p: "The Gatekeeper sub-agent generates role checks (owner, member, viewer) for the product you build." },
  ] },
  { slug: "deploy", title: "Deploy", desc: "Vercel, Docker and GitHub Pages.", time: "7 min", sections: [
    { h: "Vercel", p: "Import the repo, set the root to web and add environment variables. Deploys are automatic on push." },
    { h: "Docker", p: "Build a standalone image and run it anywhere.", code: "docker build -t ghost-ai --build-arg DOCKER=1 .\ndocker run -p 3000:3000 ghost-ai" },
    { h: "GitHub Pages", p: "Static export with mock data. API routes are excluded from this build.", code: "GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/Ghost-AI npm run build" },
    { h: "Health checks", p: "Point your platform's probe at /api/health." },
  ] },
  { slug: "troubleshooting", title: "Troubleshooting", desc: "Fixes for the most common problems.", time: "5 min", sections: [
    { h: "Port already in use", p: "Start on another port.", code: "npx next dev -p 3001" },
    { h: "EPERM on .next", p: "Stop running servers and delete the .next folder, then rebuild." },
    { h: "Clerk errors locally", p: "Remove the Clerk keys to fall back to demo mode, or confirm both keys are from the same instance." },
    { h: "Try it says API unavailable", p: "You are on the static demo. Run the app locally to use the API." },
    { h: "Still stuck", p: "Open an issue with your Node version, OS and the first error line." },
  ] },
];
