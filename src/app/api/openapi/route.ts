import { buildOpenApi } from "@/lib/openapi";
import { STATIC_CACHE, json, preflight } from "@/lib/api-utils";

export const OPTIONS = preflight;
export function GET() {
  return json(buildOpenApi(), { cache: STATIC_CACHE });
}
