import { connection } from "next/server";
import { ensureDb } from "@/db";
import { json, preflight } from "@/lib/api-utils";

const STARTED = Date.now();
export const OPTIONS = preflight;

export async function GET() {
  await connection();
  const authEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_DEMO !== "1";
  const base = { version: process.env.npm_package_version ?? "0.1.0", uptimeSeconds: Math.round((Date.now() - STARTED) / 1000), authEnabled, time: new Date().toISOString() };
  try {
    await ensureDb();
    return json({ ok: true, db: "up", ...base });
  } catch (e) {
    return json({ ok: false, db: "down", error: e instanceof Error ? e.message : "error", ...base }, { status: 503 });
  }
}
