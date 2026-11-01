import { advancePipeline } from "@/lib/repo";
import { currentUserId, json, preflight, rateLimit, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    rateLimit(req);
    return json(await advancePipeline(id, await currentUserId()));
  } catch (e) {
    return toErrorResponse(e);
  }
}
