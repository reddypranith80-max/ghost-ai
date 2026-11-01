import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brief: text("brief").notNull(),
  stack: text("stack", { mode: "json" }).$type<string[]>().notNull(),
  status: text("status").$type<"planning" | "building" | "shipped">().notNull(),
  createdAt: text("created_at").notNull(),
  ownerId: text("owner_id"),
});

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    title: text("title").notNull(),
    module: text("module").notNull(),
    agent: text("agent").notNull(),
    status: text("status").notNull(),
    progress: integer("progress").notNull().default(0),
    position: integer("position").notNull().default(0),
    subAgent: text("sub_agent"),
  },
  (t) => [index("tasks_project_idx").on(t.projectId)],
);

export const gitlog = sqliteTable(
  "gitlog",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull(),
    hash: text("hash").notNull(),
    message: text("message").notNull(),
    agent: text("agent").notNull(),
    files: integer("files").notNull().default(0),
    at: text("at").notNull(),
  },
  (t) => [index("gitlog_project_idx").on(t.projectId)],
);
