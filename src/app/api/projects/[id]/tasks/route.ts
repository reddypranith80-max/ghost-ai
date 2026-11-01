import { connection } from "next/server";
import { z } from "zod";
import { AGENTS, TaskStatus } from "@/lib/contracts";
import { getProject } from "@/lib/repo";
import { ApiError, currentUserId, fail, json, preflight, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;
const Query = z.object({ status: TaskStatus.optional(), module: z.string().min(1).optional(), agent: z.string().optional() });

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  try {
    const sp = new URL(req.url).searchParams;
    const q = Query.safeParse({ status: sp.get("status") ?? undefined, module: sp.get("module") ?? undefined, agent: sp.get("agent") ?? undefined });
    if (!q.success) throw new ApiError(400, "invalid_query", "Invalid query parameters", q.error.issues);
    const want = q.data.agent?.toLowerCase();
    const agent = want ? AGENTS.find((a) => a.toLowerCase() === want) : undefined;
    if (want && !agent) throw new ApiError(400, "invalid_query", `Unknown agent '${q.data.agent}'`);
    const p = await getProject(id, await currentUserId());
    if (!p) return fail(404, "not_found", "Project not found");
    const mod = q.data.module?.toLowerCase();
    return json(p.tasks.filter((t) => (!q.data.status || t.status === q.data.status) && (!mod || t.module.toLowerCase() === mod) && (!agent || t.agent === agent)));
  } catch (e) {
    return toErrorResponse(e);
  }
}
