import { STACK_CATALOG } from "@/lib/stack-catalog";
import { STATIC_CACHE, json, preflight } from "@/lib/api-utils";

export const OPTIONS = preflight;
export function GET() {
  return json(STACK_CATALOG, { cache: STATIC_CACHE });
}
