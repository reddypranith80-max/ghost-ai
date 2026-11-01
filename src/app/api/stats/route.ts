import { connection } from "next/server";
import { projectStats } from "@/lib/repo";
import { currentUserId, json, preflight, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;
export async function GET() {
  await connection();
  try {
    return json(await projectStats(await currentUserId()));
  } catch (e) {
    return toErrorResponse(e);
  }
}
