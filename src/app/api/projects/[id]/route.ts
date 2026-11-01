import { connection } from "next/server";
import { deleteProject, getProject } from "@/lib/repo";
import { currentUserId, fail, json, preflight, rateLimit, toErrorResponse } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };
export const OPTIONS = preflight;

export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  const { id } = await params;
  try {
    const p = await getProject(id, await currentUserId());
    return p ? json(p) : fail(404, "not_found", "Project not found");
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    rateLimit(req);
    await deleteProject(id, await currentUserId());
    return json({ ok: true, id });
  } catch (e) {
    return toErrorResponse(e);
  }
}
