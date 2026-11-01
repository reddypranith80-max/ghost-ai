import { connection } from "next/server";
import { z } from "zod";
import { AGENTS } from "@/lib/contracts";
import { getProject } from "@/lib/repo";
import { ApiError, currentUserId, fail, json, preflight, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;
const Limit = z.coerce.number().int().min(1).max(500);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  try {
    const sp = new URL(req.url).searchParams;
    const lim = sp.get("limit");
    const limit = lim === null ? undefined : Limit.safeParse(lim);
    if (limit && !limit.success) throw new ApiError(400, "invalid_query", "limit must be an integer 1-500");
    const a = sp.get("agent");
    const agent = a ? AGENTS.find((x) => x.toLowerCase() === a.toLowerCase()) : undefined;
    if (a && !agent) throw new ApiError(400, "invalid_query", `Unknown agent '${a}'`);
    const p = await getProject(id, await currentUserId());
    if (!p) return fail(404, "not_found", "Project not found");
    let log = [...p.gitlog].reverse(); // newest first
    if (agent) log = log.filter((l) => l.agent === agent);
    return json(limit?.success ? log.slice(0, limit.data) : log);
  } catch (e) {
    return toErrorResponse(e);
  }
}
