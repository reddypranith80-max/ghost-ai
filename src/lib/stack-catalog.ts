import type { StackCatalog, StackItem } from "./contracts";

const items: StackItem[] = [
  { id: "nextjs", label: "Next.js", category: "framework", why: "Full-stack React with routing, API routes and great Vercel deploys.", popular: true },
  { id: "remix", label: "Remix", category: "framework", why: "Web-standards routing with strong data loading and forms." },
  { id: "sveltekit", label: "SvelteKit", category: "framework", why: "Small bundles and simple reactivity for fast sites." },
  { id: "nuxt", label: "Nuxt", category: "framework", why: "The Vue equivalent of Next.js with batteries included." },
  { id: "tailwind", label: "Tailwind CSS", category: "ui", why: "Utility-first styling that keeps design consistent and fast.", popular: true },
  { id: "shadcn", label: "shadcn/ui", category: "ui", why: "Accessible, copy-in components you fully own.", popular: true },
  { id: "framer-motion", label: "Framer Motion", category: "ui", why: "Declarative animations for polished interfaces." },
  { id: "clerk", label: "Clerk", category: "auth", why: "Drop-in sign-in, sessions and user management.", popular: true },
  { id: "nextauth", label: "NextAuth", category: "auth", why: "Self-hosted OAuth and credentials auth for Next.js." },
  { id: "supabase-auth", label: "Supabase Auth", category: "auth", why: "Auth bundled with Postgres row-level security." },
  { id: "drizzle-sqlite", label: "Drizzle + SQLite (Turso)", category: "db", why: "Typed SQL, zero-config locally and edge-ready in prod.", popular: true },
  { id: "postgres-prisma", label: "Postgres + Prisma", category: "db", why: "Mature relational database with a friendly ORM." },
  { id: "supabase", label: "Supabase", category: "db", why: "Hosted Postgres with auth, storage and realtime." },
  { id: "mongodb", label: "MongoDB", category: "db", why: "Flexible documents for fast-changing data models." },
  { id: "vercel", label: "Vercel", category: "hosting", why: "Zero-config deploys and preview URLs for Next.js.", popular: true },
  { id: "docker", label: "Docker", category: "hosting", why: "Portable containers that run anywhere." },
  { id: "fly", label: "Fly.io", category: "hosting", why: "Run containers close to users with simple scaling." },
  { id: "cloudflare", label: "Cloudflare Pages", category: "hosting", why: "Global edge hosting with a generous free tier." },
  { id: "vitest", label: "Vitest", category: "testing", why: "Fast unit tests with Jest-compatible API.", popular: true },
  { id: "playwright", label: "Playwright", category: "testing", why: "Reliable cross-browser end-to-end tests.", popular: true },
  { id: "testing-library", label: "Testing Library", category: "testing", why: "Tests components the way users interact with them." },
];

export const STACK_ITEMS = items;

export const STACK_CATALOG: StackCatalog = {
  framework: items.filter((i) => i.category === "framework"),
  ui: items.filter((i) => i.category === "ui"),
  auth: items.filter((i) => i.category === "auth"),
  db: items.filter((i) => i.category === "db"),
  hosting: items.filter((i) => i.category === "hosting"),
  testing: items.filter((i) => i.category === "testing"),
};
