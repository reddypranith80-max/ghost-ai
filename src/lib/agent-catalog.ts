import type { AgentName } from "./contracts";

export type SubAgent = { id: string; name: string; role: string };
export type AgentSpec = {
  name: AgentName; codename: string; tagline: string; color: "cyan" | "violet" | "emerald" | "amber" | "rose" | "sky" | "fuchsia" | "lime";
  tools: string[]; produces: string; subAgents: SubAgent[];
};

/** Single source of truth for the crew: 8 lead agents, each with side agents (sub-agents). */
export const AGENT_CATALOG: AgentSpec[] = [
  { name: "Architect", codename: "ATLAS", tagline: "Turns a brief into a blueprint.", color: "cyan", tools: ["Mermaid", "ADR", "OpenAPI"], produces: "ADRs, architecture diagram, API contract",
    subAgents: [{ id: "arch-stack", name: "Stack Scout", role: "Picks libraries that fit your stack" }, { id: "arch-schema", name: "Schema Smith", role: "Designs tables and relations" }, { id: "arch-contract", name: "Contract Clerk", role: "Writes the API contract" }] },
  { name: "Backend", codename: "FORGE", tagline: "Builds the engine room.", color: "violet", tools: ["Drizzle", "Zod", "Route Handlers"], produces: "APIs, database, auth hooks, jobs",
    subAgents: [{ id: "be-db", name: "Data Digger", role: "Migrations and seed data" }, { id: "be-api", name: "Route Runner", role: "REST endpoints with validation" }, { id: "be-auth", name: "Gatekeeper", role: "Sessions, roles, permissions" }] },
  { name: "Frontend", codename: "PRISM", tagline: "Makes it beautiful and clickable.", color: "fuchsia", tools: ["Next.js", "Tailwind", "shadcn/ui"], produces: "Pages, components, design system",
    subAgents: [{ id: "fe-ui", name: "Pixel Painter", role: "Components and layout" }, { id: "fe-motion", name: "Motion Maker", role: "Animations and transitions" }, { id: "fe-a11y", name: "Access Ally", role: "Accessibility and responsive checks" }] },
  { name: "DevOps", codename: "HELM", tagline: "Gets it online and keeps it there.", color: "amber", tools: ["Docker", "GitHub Actions", "Vercel"], produces: "Pipelines, containers, deploy docs",
    subAgents: [{ id: "do-ci", name: "Pipeline Pilot", role: "CI workflows" }, { id: "do-box", name: "Box Builder", role: "Dockerfiles and images" }, { id: "do-watch", name: "Watch Tower", role: "Health checks and logs" }] },
  { name: "QA", codename: "ECHO", tagline: "Clicks everything so users don't have to.", color: "emerald", tools: ["Playwright", "Vitest"], produces: "Test suites, coverage, bug reports",
    subAgents: [{ id: "qa-e2e", name: "Click Tester", role: "End-to-end browser tests" }, { id: "qa-unit", name: "Unit Inspector", role: "Function-level tests" }, { id: "qa-load", name: "Load Lifter", role: "Stress and speed checks" }] },
  { name: "Security", codename: "AEGIS", tagline: "Thinks like an attacker, acts like a guard.", color: "rose", tools: ["npm audit", "Threat model", "CSP"], produces: "Findings and fixes",
    subAgents: [{ id: "sec-dep", name: "Dependency Dog", role: "Scans packages for known holes" }, { id: "sec-authz", name: "Authz Auditor", role: "Checks who can do what" }, { id: "sec-secret", name: "Secret Sniffer", role: "Finds leaked keys" }] },
  { name: "Docs", codename: "SCRIBE", tagline: "Explains it so anyone can run it.", color: "sky", tools: ["Markdown", "Mermaid"], produces: "README, guides, changelog",
    subAgents: [{ id: "doc-eli5", name: "Kid Translator", role: "Plain-language explainers" }, { id: "doc-api", name: "API Archivist", role: "Endpoint reference" }, { id: "doc-log", name: "Changelog Keeper", role: "Release notes" }] },
  { name: "Reviewer", codename: "JUDGE", tagline: "The final Go / No-Go gate.", color: "lime", tools: ["CodeRabbit", "Checklists"], produces: "Go / No-Go + required fixes",
    subAgents: [{ id: "rev-pr", name: "PR Patrol", role: "Reviews every pull request" }, { id: "rev-style", name: "Style Sheriff", role: "Consistency and lint" }, { id: "rev-ship", name: "Ship Marshal", role: "Definition-of-done check" }] },
];

export const getAgentSpec = (name: AgentName) => AGENT_CATALOG.find((a) => a.name === name)!;
