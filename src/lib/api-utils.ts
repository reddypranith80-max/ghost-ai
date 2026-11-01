import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { getUserId } from "@/lib/auth";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public issues?: unknown) {
    super(message);
  }
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };

export function fail(status: number, code: string, message: string, issues?: unknown, headers?: Record<string, string>) {
  return NextResponse.json({ error: { code, message, ...(issues ? { issues } : {}) } }, { status, headers: { "Cache-Control": "no-store", ...CORS, ...headers } });
}

/** JSON success. `cache` defaults to no-store (per-user live data). */
export function json(data: unknown, init: { status?: number; cache?: string; headers?: Record<string, string> } = {}) {
  return NextResponse.json(data, { status: init.status ?? 200, headers: { "Cache-Control": init.cache ?? "no-store", ...CORS, ...init.headers } });
}

export const STATIC_CACHE = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

export function preflight() {
  return new NextResponse(null, { status: 204, headers: { ...CORS, "Access-Control-Max-Age": "86400" } });
}

export function toErrorResponse(e: unknown) {
  if (e instanceof ApiError) return fail(e.status, e.code, e.message, e.issues);
  console.error("[api]", e);
  return fail(500, "internal_error", "Internal error");
}

export async function readBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(400, "invalid_input", "Invalid input", parsed.error.issues);
  return parsed.data;
}

/** Signed-in user id, or null when auth is disabled / signed out. */
export async function currentUserId(): Promise<string | null> {
  return getUserId();
}

// ---- in-memory per-IP rate limit (best effort, per server instance) ----
type Bucket = { n: number; reset: number };
const buckets: Map<string, Bucket> = ((globalThis as unknown as { __ghostRl?: Map<string, Bucket> }).__ghostRl ??= new Map());

export function clientIp(req: Request): string {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Throws ApiError 429 when `limit` writes/minute are exceeded. */
export function rateLimit(req: Request, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const key = clientIp(req);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  if (++b.n > limit) throw new ApiError(429, "rate_limited", `Too many requests; retry in ${Math.ceil((b.reset - now) / 1000)}s`);
}
