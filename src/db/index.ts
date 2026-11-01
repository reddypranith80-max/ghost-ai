import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DDL = [
  `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, brief TEXT NOT NULL, stack TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, module TEXT NOT NULL, agent TEXT NOT NULL, status TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0)`,
  `CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks (project_id)`,
  `CREATE TABLE IF NOT EXISTS gitlog (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, hash TEXT NOT NULL, message TEXT NOT NULL, agent TEXT NOT NULL, files INTEGER NOT NULL DEFAULT 0, at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS gitlog_project_idx ON gitlog (project_id)`,
];

async function addColumn(c: Client, table: string, col: string, ddl: string) {
  const info = await c.execute(`PRAGMA table_info(${table})`);
  if (!info.rows.some((r) => r.name === col)) {
    try {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
    } catch (e) {
      if (!/duplicate column/i.test(String(e))) throw e;
    }
  }
}

async function migrate(c: Client) {
  await addColumn(c, "projects", "owner_id", "TEXT");
  await addColumn(c, "tasks", "sub_agent", "TEXT");
}

type G = { __ghostClient?: Client; __ghostReady?: Promise<void> };
const g = globalThis as unknown as G;

function client(): Client {
  return (g.__ghostClient ??= createClient({
    url: process.env.DATABASE_URL || "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  }));
}

export const db = drizzle(client(), { schema });
export { schema };

/** Creates tables on first use. Seeding is done by repo.ts. */
export function ensureDb(): Promise<void> {
  return (g.__ghostReady ??= client()
    .batch(DDL, "write")
    .then(() => migrate(client()))
    .catch((e) => {
      g.__ghostReady = undefined;
      throw e;
    }));
}
