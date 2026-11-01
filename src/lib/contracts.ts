import { z } from "zod";

export const AGENTS = ["Architect","Backend","Frontend","DevOps","QA","Security","Docs","Reviewer"] as const;
export type AgentName = (typeof AGENTS)[number];

export const TaskStatus = z.enum(["todo","running","review","done","failed"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const ProjectInput = z.object({
  name: z.string().min(2).max(60),
  brief: z.string().min(10).max(2000),
  stack: z.array(z.string().min(1)).min(1).max(20),
});
export type ProjectInput = z.infer<typeof ProjectInput>;

export type Project = ProjectInput & { id: string; status: "planning"|"building"|"shipped"; createdAt: string };
export type Task = { id: string; projectId: string; title: string; module: string; agent: AgentName; status: TaskStatus; progress: number; subAgent?: string | null };
export type GitLog = { id: string; projectId: string; hash: string; message: string; agent: AgentName; files: number; at: string };
export type AgentState = { name: AgentName; status: "idle"|"working"|"done"; currentTask: string | null };
export type ProjectDetail = Project & { tasks: Task[]; gitlog: GitLog[]; agents: AgentState[] };

/** Endpoints (all JSON): GET/POST /api/projects · GET /api/projects/:id (ProjectDetail) · GET /api/health */

export type ApiErrorBody = { error: { code: string; message: string; issues?: unknown } };
export type StackItem = { id: string; label: string; category: "framework" | "ui" | "auth" | "db" | "hosting" | "testing"; why: string; popular?: boolean };
export type StackCatalog = Record<StackItem["category"], StackItem[]>;
export type Stats = {
  projects: number; tasks: number; tasksByStatus: Record<TaskStatus, number>;
  commits: number; agentsWorking: number; completionPct: number;
};
