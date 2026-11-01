import { z } from "zod";
import { TaskStatus } from "@/lib/contracts";
import { updateTask } from "@/lib/repo";
import { ApiError, currentUserId, json, preflight, rateLimit, readBody, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;
const Patch = z
  .object({ status: TaskStatus.optional(), progress: z.number().int().min(0).max(100).optional() })
  .refine((v) => v.status !== undefined || v.progress !== undefined, { message: "Provide status and/or progress" });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  try {
    rateLimit(req);
    const patch = await readBody(req, Patch);
    if (patch.status === "done" && patch.progress !== undefined && patch.progress < 100) throw new ApiError(400, "invalid_input", "A done task must have progress 100");
    return json(await updateTask(id, taskId, patch, await currentUserId()));
  } catch (e) {
    return toErrorResponse(e);
  }
}
