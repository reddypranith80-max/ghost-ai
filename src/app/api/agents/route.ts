import { AGENT_CATALOG } from "@/lib/agent-catalog";
import { STATIC_CACHE, json, preflight } from "@/lib/api-utils";

export const OPTIONS = preflight;
export function GET() {
  return json(AGENT_CATALOG, { cache: STATIC_CACHE });
}
