import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { STATIC_CACHE, fail, json, preflight } from "@/lib/api-utils";

export const OPTIONS = preflight;
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const a = AGENT_CATALOG.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return a ? json(a, { cache: STATIC_CACHE }) : fail(404, "not_found", `Unknown agent '${name}'`);
}
