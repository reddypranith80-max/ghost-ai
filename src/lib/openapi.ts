import { AGENTS } from "./contracts";

type Op = { summary: string; tags: string[]; parameters?: unknown[]; requestBody?: unknown; responses: Record<string, unknown> };

const ref = (n: string) => ({ $ref: `#/components/schemas/${n}` });
const jsonRes = (description: string, schema: unknown) => ({ description, content: { "application/json": { schema } } });
const err = (description: string) => ({ description, content: { "application/json": { schema: ref("ApiError") } } });
const idParam = { name: "id", in: "path", required: true, schema: { type: "string" } };
const q = (name: string, schema: unknown) => ({ name, in: "query", required: false, schema });
const E400 = err("Invalid input"), E404 = err("Not found"), E403 = err("Read-only project"), E429 = err("Rate limited");

export function buildOpenApi() {
  const paths: Record<string, Record<string, Op>> = {
    "/api/health": { get: { summary: "Service health", tags: ["System"], responses: { "200": jsonRes("Healthy", ref("Health")), "503": jsonRes("DB down", ref("Health")) } } },
    "/api/openapi": { get: { summary: "This document", tags: ["System"], responses: { "200": { description: "OpenAPI 3.1 JSON" } } } },
    "/api/stats": { get: { summary: "Totals across visible projects", tags: ["System"], responses: { "200": jsonRes("Stats", ref("Stats")) } } },
    "/api/stack": { get: { summary: "Recommended stack catalog by category", tags: ["Catalog"], responses: { "200": jsonRes("Catalog", ref("StackCatalog")) } } },
    "/api/agents": { get: { summary: "Agent crew with sub-agents", tags: ["Catalog"], responses: { "200": jsonRes("Agents", { type: "array", items: ref("AgentSpec") }) } } },
    "/api/agents/{name}": { get: { summary: "One agent (case-insensitive)", tags: ["Catalog"], parameters: [{ name: "name", in: "path", required: true, schema: { type: "string", enum: [...AGENTS] } }], responses: { "200": jsonRes("Agent", ref("AgentSpec")), "404": E404 } } },
    "/api/projects": {
      get: { summary: "List projects", tags: ["Projects"], responses: { "200": jsonRes("Projects", { type: "array", items: ref("ProjectDetail") }) } },
      post: { summary: "Create project (generates tasks)", tags: ["Projects"], requestBody: { required: true, content: { "application/json": { schema: ref("ProjectInput") } } }, responses: { "201": jsonRes("Created", ref("ProjectDetail")), "400": E400, "429": E429 } },
    },
    "/api/projects/{id}": {
      get: { summary: "Project detail", tags: ["Projects"], parameters: [idParam], responses: { "200": jsonRes("Project", ref("ProjectDetail")), "404": E404 } },
      delete: { summary: "Delete project", tags: ["Projects"], parameters: [idParam], responses: { "200": jsonRes("Deleted", { type: "object", properties: { ok: { type: "boolean" }, id: { type: "string" } } }), "403": E403, "404": E404, "429": E429 } },
    },
    "/api/projects/{id}/tasks": { get: { summary: "List tasks", tags: ["Tasks"], parameters: [idParam, q("status", ref("TaskStatus")), q("module", { type: "string" }), q("agent", { type: "string", enum: [...AGENTS] })], responses: { "200": jsonRes("Tasks", { type: "array", items: ref("Task") }), "400": E400, "404": E404 } } },
    "/api/projects/{id}/tasks/{taskId}": {
      patch: { summary: "Update task status/progress", tags: ["Tasks"], parameters: [idParam, { name: "taskId", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: ref("TaskStatus"), progress: { type: "integer", minimum: 0, maximum: 100 } } } } } }, responses: { "200": jsonRes("Updated project", ref("ProjectDetail")), "400": E400, "403": E403, "404": E404, "429": E429 } },
    },
    "/api/projects/{id}/gitlog": { get: { summary: "Git log, newest first", tags: ["Projects"], parameters: [idParam, q("agent", { type: "string", enum: [...AGENTS] }), q("limit", { type: "integer", minimum: 1, maximum: 500 })], responses: { "200": jsonRes("Commits", { type: "array", items: ref("GitLog") }), "400": E400, "404": E404 } } },
    "/api/projects/{id}/export": { get: { summary: "Download project report", tags: ["Projects"], parameters: [idParam, q("format", { type: "string", enum: ["json", "md"], default: "json" })], responses: { "200": { description: "Attachment", content: { "application/json": { schema: ref("ProjectDetail") }, "text/markdown": { schema: { type: "string" } } } }, "400": E400, "404": E404 } } },
    "/api/projects/{id}/run": { post: { summary: "Advance the simulated pipeline one step", tags: ["Pipeline"], parameters: [idParam], responses: { "200": jsonRes("Updated project", ref("ProjectDetail")), "403": E403, "404": E404, "409": err("Pipeline already complete"), "429": E429 } } },
  };
  const agent = { type: "string", enum: [...AGENTS] };
  return {
    openapi: "3.1.0",
    info: { title: "Ghost AI API", version: "0.1.0", description: "Simulated multi-agent software factory. Errors use { error: { code, message } }. Writes are rate limited to 60/min per IP." },
    servers: [{ url: "/" }],
    paths,
    components: {
      schemas: {
        ApiError: { type: "object", required: ["error"], properties: { error: { type: "object", required: ["code", "message"], properties: { code: { type: "string" }, message: { type: "string" }, issues: {} } } } },
        TaskStatus: { type: "string", enum: ["todo", "running", "review", "done", "failed"] },
        ProjectInput: { type: "object", required: ["name", "brief", "stack"], properties: { name: { type: "string", minLength: 2, maxLength: 60 }, brief: { type: "string", minLength: 10, maxLength: 2000 }, stack: { type: "array", minItems: 1, maxItems: 20, items: { type: "string" } } } },
        Task: { type: "object", properties: { id: { type: "string" }, projectId: { type: "string" }, title: { type: "string" }, module: { type: "string" }, agent, status: ref("TaskStatus"), progress: { type: "integer" }, subAgent: { type: ["string", "null"] } } },
        GitLog: { type: "object", properties: { id: { type: "string" }, projectId: { type: "string" }, hash: { type: "string" }, message: { type: "string" }, agent, files: { type: "integer" }, at: { type: "string", format: "date-time" } } },
        AgentState: { type: "object", properties: { name: agent, status: { type: "string", enum: ["idle", "working", "done"] }, currentTask: { type: ["string", "null"] } } },
        ProjectDetail: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, brief: { type: "string" }, stack: { type: "array", items: { type: "string" } }, status: { type: "string", enum: ["planning", "building", "shipped"] }, createdAt: { type: "string" }, tasks: { type: "array", items: ref("Task") }, gitlog: { type: "array", items: ref("GitLog") }, agents: { type: "array", items: ref("AgentState") } } },
        AgentSpec: { type: "object", properties: { name: agent, codename: { type: "string" }, tagline: { type: "string" }, color: { type: "string" }, tools: { type: "array", items: { type: "string" } }, produces: { type: "string" }, subAgents: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, role: { type: "string" } } } } } },
        Stats: { type: "object", properties: { projects: { type: "integer" }, tasks: { type: "integer" }, tasksByStatus: { type: "object", additionalProperties: { type: "integer" } }, commits: { type: "integer" }, agentsWorking: { type: "integer" }, completionPct: { type: "integer" } } },
        StackCatalog: { type: "object", additionalProperties: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, category: { type: "string" }, why: { type: "string" }, popular: { type: "boolean" } } } } },
        Health: { type: "object", properties: { ok: { type: "boolean" }, db: { type: "string" }, version: { type: "string" }, uptimeSeconds: { type: "integer" }, authEnabled: { type: "boolean" }, time: { type: "string" } } },
      },
    },
  };
}
