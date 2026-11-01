import { connection } from "next/server";
import type { ProjectDetail } from "@/lib/contracts";
import { getProject } from "@/lib/repo";
import { ApiError, currentUserId, fail, preflight, toErrorResponse } from "@/lib/api-utils";

export const OPTIONS = preflight;

function toMarkdown(p: ProjectDetail): string {
  const done = p.tasks.filter((t) => t.status === "done").length;
  const modules = [...new Set(p.tasks.map((t) => t.module))];
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  return [
    `# ${p.name}`,
    "",
    `Status: **${p.status}** | Created: ${p.createdAt} | Progress: ${done}/${p.tasks.length} tasks done`,
    "",
    "## Brief",
    "",
    p.brief,
    "",
    "## Stack",
    "",
    ...p.stack.map((s) => `- ${s}`),
    "",
    "## Modules",
    "",
    ...modules.map((m) => `- **${m}**: ${p.tasks.filter((t) => t.module === m && t.status === "done").length}/${p.tasks.filter((t) => t.module === m).length} done`),
    "",
    "## Tasks",
    "",
    "| # | Task | Module | Agent | Sub-agent | Status | Progress |",
    "|---|------|--------|-------|-----------|--------|----------|",
    ...p.tasks.map((t, i) => `| ${i + 1} | ${cell(t.title)} | ${t.module} | ${t.agent} | ${t.subAgent ?? "-"} | ${t.status} | ${t.progress}% |`),
    "",
    "## Git log",
    "",
    ...(p.gitlog.length ? [...p.gitlog].reverse().map((g) => `- \`${g.hash}\` ${g.message} (${g.agent}, ${g.files} files, ${g.at})`) : ["_No commits yet._"]),
    "",
    "## Flow",
    "",
    "Architect -> Backend -> Frontend -> DevOps -> QA -> Security -> Docs -> Reviewer",
    "",
    "```mermaid",
    "flowchart LR",
    "  Architect --> Backend --> Frontend --> DevOps --> QA --> Security --> Docs --> Reviewer",
    "```",
    "",
  ].join("\n");
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  try {
    const format = new URL(req.url).searchParams.get("format") ?? "json";
    if (format !== "json" && format !== "md") throw new ApiError(400, "invalid_query", "format must be 'json' or 'md'");
    const p = await getProject(id, await currentUserId());
    if (!p) return fail(404, "not_found", "Project not found");
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
    const body = format === "md" ? toMarkdown(p) : JSON.stringify(p, null, 2);
    return new Response(body, {
      headers: {
        "Content-Type": format === "md" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.${format}"`,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
}
