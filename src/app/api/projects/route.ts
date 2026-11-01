import { connection } from "next/server";
import { ProjectInput } from "@/lib/contracts";
import { createProject, listProjects } from "@/lib/repo";
import { currentUserId, json, preflight, rateLimit, readBody, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;

export async function GET() {
  await connection();
  try {
    return json(await listProjects(await currentUserId()));
  } catch (e) {
    return toErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    rateLimit(req);
    const input = await readBody(req, ProjectInput);
    return json(await createProject(input, await currentUserId()), { status: 201 });
  } catch (e) {
    return toErrorResponse(e);
  }
}
