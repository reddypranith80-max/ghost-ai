// Builds "Building Ghost AI from Scratch": docs/book/Ghost-AI-Book.md and docs/book/Ghost-AI-Book.pdf.
//
//   node scripts/build-book.mjs [--no-pdf] [--no-checks] [--no-render]
//
// Everything is read from the real repository: git history, docs/, source files, tests, configs. Narrative
// chapters live in docs/book/chapters/*.md and per-file notes in docs/book/file-notes.json. The PDF is printed
// with the system Microsoft Edge through Playwright (channel "msedge"); the TOC page numbers are measured by
// printing every chapter on its own first (each chapter starts on a fresh page, so offsets add up exactly).
//
//   --no-pdf     write only the Markdown
//   --no-checks  reuse the last captured tsc/eslint/playwright --list results (docs/book/.cache/checks.json)
//   --no-render  do not render missing Mermaid diagrams (use docs/diagrams/*.svg or leave a placeholder)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";
import { marked } from "marked";
import hljs from "highlight.js";
import * as jsyaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);
const BOOK = "docs/book";
const CACHE = path.join(BOOK, ".cache");
fs.mkdirSync(CACHE, { recursive: true });
const args = new Set(process.argv.slice(2));
const T0 = Date.now();
const log = (...a) => console.log(`[book ${((Date.now() - T0) / 1000).toFixed(0)}s]`, ...a);

// ---------------------------------------------------------------- helpers
const rd = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const exists = (p) => fs.existsSync(p);
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).replace(/\r\n/g, "\n");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtKB = (n) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`);
const countLines = (t) => (t === "" ? 0 : t.replace(/\n$/, "").split("\n").length);
const ghSlug = (s) =>
  s.toLowerCase().trim().replace(/<[^>]*>/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
const mdCell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const fence = (code, lang = "") => {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((m) => m[0].length));
  const f = "`".repeat(longest + 1);
  return `${f}${lang}\n${code.replace(/\n$/, "")}\n${f}`;
};
const table = (head, rows) =>
  `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.map(mdCell).join(" | ")} |`).join("\n")}`;
/** Demote markdown headings by `by` levels (fence aware) and drop the first H1 when `dropH1`. */
function demote(md, by, dropH1) {
  let inFence = null;
  let dropped = !dropH1;
  const out = [];
  for (const line of md.split("\n")) {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!inFence) inFence = f[1][0].repeat(f[1].length);
      else if (f[1][0] === inFence[0] && f[1].length >= inFence.length) inFence = null;
      out.push(line);
      continue;
    }
    const h = !inFence && line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      if (!dropped && h[1].length === 1) {
        dropped = true;
        continue;
      }
      out.push(`${"#".repeat(Math.min(6, h[1].length + by))} ${h[2]}`);
    } else out.push(line);
  }
  return out.join("\n").replace(/^\n+/, "");
}
const run = (cmd, argv, opts = {}) => {
  const t = Date.now();
  const r = spawnSync(cmd, argv, { encoding: "utf8", shell: true, maxBuffer: 64 * 1024 * 1024, ...opts });
  return { code: r.status, ms: Date.now() - t, out: ((r.stdout || "") + (r.stderr || "")).replace(/\r\n/g, "\n").replace(/\x1b\[[0-9;]*m/g, "") };
};

// ---------------------------------------------------------------- repository data
const head = git("log", "-1", "--pretty=%h|%H|%aI|%s").trim().split("|");
const HEAD = { short: head[0], full: head[1], date: head[2], subject: head.slice(3).join("|") };
const dirty = git("status", "--porcelain").trim().length > 0;
const OWN_UNTRACKED = ["scripts/build-book.mjs", "docs/book/file-notes.json", "docs/book/docker-lint.txt", "docs/book/.gitignore"];
const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
const GENERATED = /^docs\/book\/(Ghost-AI-Book\.(md|pdf)|build-info\.json|\.cache\/)/;
const allFiles = [...new Set([...tracked, ...OWN_UNTRACKED.filter(exists)])].filter((f) => !GENERATED.test(f)).sort();
const notes = JSON.parse(rd(`${BOOK}/file-notes.json`));
const packageJson = JSON.parse(rd("package.json"));

const BINARY = /\.(png|jpe?g|gif|ico|webm|mp4|woff2?|ttf|pdf|zip)$/i;
const isListed = (f) =>
  !/(^|\/)package-lock\.json$/.test(f) &&
  !f.startsWith("public/demo/") &&
  !f.startsWith("docs/diagrams/") &&
  !(f.startsWith("docs/") && f !== "docs/book/file-notes.json" && !f.startsWith("docs/book/") ) &&
  !(f.startsWith("docs/book/") && f !== "docs/book/file-notes.json") &&
  !BINARY.test(f);
const listed = allFiles.filter(isListed);
const text = new Map(); // path -> content
for (const f of allFiles) if (!BINARY.test(f) && !f.endsWith("package-lock.json") && exists(f)) text.set(f, rd(f));

const langOf = (f) => {
  const b = path.basename(f);
  if (b === "Dockerfile") return "dockerfile";
  const e = path.extname(f).toLowerCase();
  return { ".ts": "typescript", ".tsx": "typescript", ".mjs": "javascript", ".js": "javascript", ".json": "json", ".css": "css", ".yml": "yaml", ".yaml": "yaml", ".md": "markdown", ".svg": "xml", ".txt": "plaintext" }[e] ?? "plaintext";
};
const fenceLang = (f) => ({ typescript: path.extname(f) === ".tsx" ? "tsx" : "ts", javascript: "js", plaintext: "text", dockerfile: "dockerfile", xml: "xml" })[langOf(f)] ?? langOf(f);

// exports / imports / routes
function detectExports(src) {
  const names = [];
  for (const m of src.matchAll(/^export\s+(default\s+)?(?:async\s+)?(?:function\*?|const|let|class|type|interface|enum)\s+(\w+)/gm)) names.push(m[1] ? `${m[2]} (default)` : m[2]);
  for (const m of src.matchAll(/^export\s*\{([^}]*)\}/gm)) for (const n of m[1].split(",")) if (n.trim()) names.push(n.trim().split(/\s+as\s+/).pop());
  if (/^export\s+default\s+(?!async\s+function|function|class)/m.test(src) && !names.some((n) => n.includes("(default)"))) names.push("default");
  return [...new Set(names)];
}
function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.posix.join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.posix.join(path.posix.dirname(from), spec);
  else return null;
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.css`, `${base}/index.ts`, `${base}/index.tsx`]) if (text.has(c)) return c;
  return null;
}
const importsOf = new Map();
const usedBy = new Map();
for (const [f, src] of text) {
  if (!/\.(tsx?|mjs|js|css)$/.test(f)) continue;
  const specs = new Set();
  for (const m of src.matchAll(/(?:from|import|require)\s*\(?\s*["']([^"']+)["']/g)) specs.add(m[1]);
  for (const m of src.matchAll(/@import\s+["']([^"']+)["']/g)) specs.add(m[1]);
  const res = [...specs].map((s) => resolveImport(f, s)).filter(Boolean);
  importsOf.set(f, res);
  for (const r of res) usedBy.set(r, [...(usedBy.get(r) ?? []), f]);
}
function routeOf(f) {
  if (!f.startsWith("src/app/")) return null;
  const rel = f.slice("src/app/".length);
  const isPage = /(^|\/)page\.tsx$/.test(rel);
  const isRoute = /(^|\/)route\.ts$/.test(rel);
  if (!isPage && !isRoute) return null;
  const segs = rel.split("/").slice(0, -1).filter((s) => !/^\(.*\)$/.test(s)).map((s) => (s.startsWith("[[...") ? "*" : s.startsWith("[") ? `:${s.slice(1, -1)}` : s));
  return { kind: isPage ? "page" : "api", url: "/" + segs.join("/") };
}
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
const methodsOf = (src) => METHODS.filter((m) => new RegExp(`export\\s+(?:async\\s+function\\s+${m}\\b|const\\s+${m}\\b)`).test(src));

// ---------------------------------------------------------------- git timeline
function loadCommits() {
  const rec = git("log", "--reverse", "--numstat", "--pretty=format:%x1e%H%x1f%h%x1f%an%x1f%aI%x1f%s%x1f%b%x1f").split("\x1e").filter(Boolean);
  const ns = git("log", "--reverse", "--name-status", "--pretty=format:%x1e%H%x1f").split("\x1e").filter(Boolean);
  const status = new Map();
  for (const r of ns) {
    const [h, rest] = r.split("\x1f");
    const m = new Map();
    for (const l of rest.split("\n").filter(Boolean)) {
      const p = l.split("\t");
      m.set(p[p.length - 1], p[0][0]);
    }
    status.set(h, m);
  }
  return rec.map((r) => {
    const parts = r.split("\x1f");
    const [full, short, author, date, subject, body] = parts;
    const files = (parts[6] ?? "").split("\n").filter(Boolean).map((l) => {
      const [a, d, ...p] = l.split("\t");
      const file = p.join("\t");
      return { file, add: a === "-" ? null : +a, del: d === "-" ? null : +d, st: status.get(full)?.get(file.replace(/.*=> /, "").replace(/[{}]/g, "")) ?? status.get(full)?.get(file) ?? "M" };
    });
    return { full, short, author, date, subject, body: body.trim(), files };
  });
}
const commits = loadCommits();

// ---------------------------------------------------------------- Mermaid diagrams
const docFiles = ["docs/context.md", "docs/prose.md", "docs/architecture.md", "docs/connectivity.md", "docs/methods.md", "docs/logs.md", "docs/agents.md", "docs/auth.md", "docs/devops.md", "docs/coderabbit.md", "docs/adr/0001-stack.md", "docs/CODE-TOUR.md", "docs/RUN-ME.md", "docs/EXPLAIN-LIKE-IM-5.md", "docs/COMMANDS.md", "docs/WORKFLOWS.md", "docs/README.md", "docs/product-brief.md"];
const mermaidSvg = new Map(); // trimmed code -> svg text
const mermaidStats = { blocks: 0, rendered: 0, cached: 0, fromDiagramsDir: 0, failed: 0 };
function edgePath() {
  return [process.env.PUPPETEER_EXECUTABLE_PATH, process.env.CHROME_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean).find(exists);
}
function prepareMermaid() {
  const exe = edgePath();
  const mmdc = path.join(ROOT, "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
  fs.mkdirSync(path.join(CACHE, "diagrams"), { recursive: true });
  const cfg = path.join(os.tmpdir(), "book-puppeteer.json");
  if (exe) fs.writeFileSync(cfg, JSON.stringify({ executablePath: exe, args: ["--no-sandbox", "--disable-setuid-sandbox"] }));
  for (const f of docFiles) {
    if (!exists(f)) continue;
    let idx = 0;
    for (const m of rd(f).matchAll(/```mermaid\n([\s\S]*?)\n```/g)) {
      idx++;
      mermaidStats.blocks++;
      const code = m[1].trim();
      const hash = crypto.createHash("sha1").update(code).digest("hex").slice(0, 16);
      const cached = path.join(CACHE, "diagrams", `${hash}.svg`);
      if (exists(cached)) { mermaidSvg.set(code, rd(cached)); mermaidStats.cached++; continue; }
      if (exe && !args.has("--no-render") && exists(mmdc)) {
        const inp = path.join(os.tmpdir(), `book-${hash}.mmd`);
        fs.writeFileSync(inp, code);
        const r = run(`"${process.execPath}"`, [`"${mmdc}"`, "-i", `"${inp}"`, "-o", `"${cached}"`, "-p", `"${cfg}"`, "-b", "white", "-q"]);
        if (r.code === 0 && exists(cached)) { mermaidSvg.set(code, rd(cached)); mermaidStats.rendered++; log(`rendered diagram ${f} #${idx}`); continue; }
        log(`diagram render failed ${f} #${idx}: ${r.out.split("\n")[0]}`);
      }
      const fallback = `docs/diagrams/${path.basename(f, ".md").toLowerCase()}-${idx}.svg`;
      if (exists(fallback)) { mermaidSvg.set(code, rd(fallback)); mermaidStats.fromDiagramsDir++; } else mermaidStats.failed++;
    }
  }
}
function svgToImg(svg) {
  const vb = svg.match(/viewBox="([\d.\-\s]+)"/);
  let w = 600, h = 300;
  if (vb) { const p = vb[1].trim().split(/\s+/).map(Number); w = Math.round(p[2]); h = Math.round(p[3]); }
  let s = svg.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, "").replace(/style="[^"]*"/, "")} width="${w}" height="${h}">`);
  if (!/xmlns=/.test(s.slice(0, 300))) s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return `<img class="diagram" alt="diagram" width="${w}" height="${h}" src="data:image/svg+xml;base64,${Buffer.from(s).toString("base64")}">`;
}

// ---------------------------------------------------------------- generated content (markdown)
const catalogSrc = rd("src/lib/agent-catalog.ts");
const AGENT_CATALOG = new Function(`return ${catalogSrc.slice(catalogSrc.indexOf("= [", catalogSrc.indexOf("AGENT_CATALOG")) + 2, catalogSrc.indexOf("];", catalogSrc.indexOf("AGENT_CATALOG")) + 1)}`)();
const stackSrc = rd("src/lib/stack-catalog.ts");
let STACK = [];
try {
  const i = stackSrc.indexOf("const items");
  const a = stackSrc.indexOf("= [", i) + 2;
  STACK = new Function(`return ${stackSrc.slice(a, stackSrc.indexOf("];", a) + 1)}`)();
} catch { /* leave empty */ }

function genRolesTable() {
  const roles = rd("docs/agents.md").match(/\|\s*Agent[\s\S]*?\n\n/)?.[0] ?? "";
  return roles.trim();
}
function genSubagentTable() {
  const rows = [];
  for (const a of AGENT_CATALOG) a.subAgents.forEach((s, i) => rows.push([i === 0 ? `**${a.name}** (${a.codename})` : "", `\`${s.id}\``, s.name, s.role]));
  return table(["Lead agent", "Sub-agent id", "Name", "Role"], rows);
}
function genAgentCatalogTable() {
  return table(["Agent", "Codename", "Colour", "Tagline", "Tools", "Produces"], AGENT_CATALOG.map((a) => [a.name, a.codename, a.color, a.tagline, a.tools.join(", "), a.produces]));
}
function genStackTable() {
  if (!STACK.length) return "_Stack catalogue could not be parsed._";
  return table(["Category", "Id", "Label", "Why", "Popular"], STACK.map((s) => [s.category, `\`${s.id}\``, s.label, s.why, s.popular ? "yes" : ""]));
}

const COMMIT_NOTES = {
  "0c701eb": "The untouched `create-next-app` scaffold: Next.js app router, Tailwind setup, default assets and TypeScript/ESLint configuration. Everything after this commit is the Ghost AI build.",
  "468f9a9": "A checkpoint of the first multi-agent phase, committed while work was still in progress. It is by far the largest commit: the landing page, marketing pages, the dashboard (store, shell, views), the simulation library, auth wiring, the Docker/CI/Pages/CodeQL/Dependabot/CodeRabbit files, the Mermaid tooling and most of `docs/`. `package-lock.json` alone accounts for a large share of the line counts.",
  "3f85f45": "The phase 1 output of the agents. Its message says the API routes were restored: the thirteen route handlers under `src/app/api` are re-added here after the concurrent Pages build incident described in Chapter 4.",
  "9da51aa": "QA and Docs deliverables: the Playwright end-to-end suite on the Edge channel (`playwright.config.ts`, `tests/e2e/*`), plus the user-facing documentation set (RUN-ME, EXPLAIN-LIKE-IM-5, COMMANDS, WORKFLOWS, CODE-TOUR, docs index), CONTRIBUTING, CHANGELOG, a rewritten README and adjusted architecture, devops and methods docs.",
  "cc54900": "The Windows static-export fix: `scripts/fix-win-export.mjs` flattens the prefetch segment files, `scripts/pages-build.mjs` calls it, and `scripts/static-smoke.mjs` tests the exported site under the `/ghost-ai/` base path.",
  "0befd76": "The recorded demo: `scripts/record-demo.mjs`, the demo video and poster under `public/demo`, a Playwright global teardown that removes projects created by the tests, and test and config adjustments.",
  "163c25f": "A CI hardening fix made after the first verification pass: the root layout stops depending on the generated `LayoutProps` type so `tsc` passes on a clean checkout, CodeQL is skipped for private repositories, `npm audit` only looks at production dependencies, and `.env.example` becomes a tracked file.",
  a12927f: "A documentation-only commit that rewrites `STATUS.md` into the verified / not-verified form that Part V builds on.",
};
function topDirs(files) {
  const c = {};
  for (const f of files) { const d = f.file.includes("/") ? f.file.split("/").slice(0, f.file.startsWith("src/") ? 2 : 1).join("/") : "(root)"; c[d] = (c[d] ?? 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
}
function genTimeline() {
  const out = [];
  const totalAdd = commits.reduce((s, c) => s + c.files.reduce((x, f) => x + (f.add ?? 0), 0), 0);
  const totalDel = commits.reduce((s, c) => s + c.files.reduce((x, f) => x + (f.del ?? 0), 0), 0);
  out.push(`The repository has **${commits.length} commits** in total (${commits[0].date.slice(0, 10)} to ${commits.at(-1).date.slice(0, 10)}), touching ${new Set(commits.flatMap((c) => c.files.map((f) => f.file))).size} distinct paths with ${totalAdd.toLocaleString("en")} lines added and ${totalDel.toLocaleString("en")} removed (lockfile and binary files included in the counts where git reports them). The list below is chronological and is generated from \`git log --stat\`; times are as recorded by git, in the author's time zone.`);
  out.push("");
  out.push("### At a glance");
  out.push("");
  out.push(table(["#", "Commit", "Date and time", "Files", "Added", "Removed", "Message"], commits.map((c, i) => [i + 1, `\`${c.short}\``, c.date.replace("T", " ").replace(/([+-]\d\d:\d\d)$/, " $1"), c.files.length, c.files.reduce((x, f) => x + (f.add ?? 0), 0).toLocaleString("en"), c.files.reduce((x, f) => x + (f.del ?? 0), 0).toLocaleString("en"), c.subject])));
  out.push("");
  const maxAdd = Math.max(...commits.map((c) => c.files.reduce((x, f) => x + (f.add ?? 0), 0)));
  out.push("Lines added per commit, excluding `package-lock.json` (a bar is proportional to the largest commit):");
  out.push("");
  out.push(fence(commits.map((c, i) => { const a = c.files.filter((f) => f.file !== "package-lock.json").reduce((x, f) => x + (f.add ?? 0), 0); return `${String(i + 1).padStart(2)} ${c.short}  ${"#".repeat(Math.round((a / Math.max(1, maxAdd)) * 50)).padEnd(50)} ${a.toLocaleString("en")}`; }).join("\n"), "text"));
  commits.forEach((c, i) => {
    const add = c.files.reduce((x, f) => x + (f.add ?? 0), 0), del = c.files.reduce((x, f) => x + (f.del ?? 0), 0);
    out.push("", `### ${i + 1}. \`${c.short}\` ${c.subject}`, "");
    out.push(`- **Date:** ${c.date}`, `- **Author:** ${c.author}`, `- **Full hash:** \`${c.full}\``, `- **Change size:** ${c.files.length} files, +${add.toLocaleString("en")} / -${del.toLocaleString("en")}`);
    const st = {};
    for (const f of c.files) st[f.st] = (st[f.st] ?? 0) + 1;
    out.push(`- **Status mix:** ${Object.entries(st).map(([k, v]) => `${v} ${{ A: "added", M: "modified", D: "deleted", R: "renamed" }[k] ?? k}`).join(", ") || "none"}`);
    if (c.body) out.push("", "Commit message body:", "", fence(c.body, "text"));
    out.push("", COMMIT_NOTES[c.short] ?? `Touches ${topDirs(c.files).slice(0, 4).map(([d, n]) => `\`${d}\` (${n})`).join(", ")}.`, "");
    out.push(`Where the files landed: ${topDirs(c.files).map(([d, n]) => `\`${d}\` ${n}`).join(", ")}.`, "");
    out.push(table(["St", "File", "Added", "Removed"], c.files.map((f) => [f.st, `\`${f.file}\``, f.add ?? "bin", f.del ?? "bin"])));
  });
  return out.join("\n");
}
function genTree() {
  const root = {};
  for (const f of allFiles) { let n = root; for (const s of f.split("/")) n = n[s] ??= {}; }
  const lines = [".  (repository root, tracked files; * = counted lines)"];
  const walk = (n, prefix, p) => {
    const keys = Object.keys(n).sort((a, b) => (Object.keys(n[a]).length ? 0 : 1) - (Object.keys(n[b]).length ? 0 : 1) || a.localeCompare(b));
    keys.forEach((k, i) => {
      const last = i === keys.length - 1;
      const full = p ? `${p}/${k}` : k;
      const isDir = Object.keys(n[k]).length > 0;
      const t = text.get(full);
      lines.push(`${prefix}${last ? "└── " : "├── "}${k}${isDir ? "/" : t !== undefined ? `  (${countLines(t)})` : ""}`);
      if (isDir) walk(n[k], prefix + (last ? "    " : "│   "), full);
    });
  };
  walk(root, "", "");
  return fence(lines.join("\n"), "text");
}
function genRoutes() {
  const pages = [], api = [];
  for (const f of allFiles) {
    const r = routeOf(f);
    if (!r) continue;
    if (r.kind === "page") pages.push([r.url, `\`${f}\``, f.startsWith("src/app/dashboard") ? "dashboard" : f.includes("(auth)") ? "auth" : f.includes("(marketing)") ? "marketing" : "site"]);
    else api.push([methodsOf(text.get(f)).filter((m) => m !== "OPTIONS").join(", ") + " (+OPTIONS)", `\`${r.url}\``, `\`${f}\``]);
  }
  pages.sort((a, b) => a[0].localeCompare(b[0]));
  api.sort((a, b) => a[1].localeCompare(b[1]));
  return { pages, api, md: `### Pages (${pages.length} page files)\n\n${table(["URL pattern", "File", "Area"], pages)}\n\nDynamic segments are shown as \`:name\`; \`*\` is an optional catch-all. \`/agents/:slug\` and \`/docs/:slug\` are pre-rendered for every entry of the agent catalogue and the guides list through \`generateStaticParams\`.\n\n### API routes (${api.length} route handlers)\n\n${table(["Methods", "URL pattern", "File"], api)}\n\nEvery handler also exports \`OPTIONS\` (CORS preflight). Methods are detected from the exports in each \`route.ts\` file.` };
}
function genDataModel() {
  const s = text.get("src/db/schema.ts");
  const out = [];
  for (const m of s.matchAll(/export const (\w+) = sqliteTable\(\s*"(\w+)",\s*\{([\s\S]*?)\n\s*\}/g)) {
    const rows = [];
    for (const c of m[3].split("\n")) {
      const cm = c.match(/^\s*(\w+):\s*(text|integer)\("(\w+)"(?:,\s*\{\s*mode:\s*"(\w+)"\s*\})?\)(.*?),?\s*$/);
      if (!cm) continue;
      const mods = [cm[5].includes("primaryKey") && "primary key", cm[5].includes("notNull") && "not null", (cm[5].match(/default\(([^)]*)\)/) ?? [])[1] && `default ${cm[5].match(/default\(([^)]*)\)/)[1]}`, cm[4] && `mode ${cm[4]}`, (cm[5].match(/\$type<([^>]*(?:>[^>]*)?)>/) ?? [])[1] && `type ${cm[5].match(/\$type<(.*)>\(\)/)?.[1] ?? ""}`].filter(Boolean).join(", ");
      rows.push([`\`${cm[1]}\``, `\`${cm[3]}\``, cm[2] === "text" ? "TEXT" : "INTEGER", mods]);
    }
    out.push(`### Table \`${m[2]}\` (Drizzle \`${m[1]}\`)`, "", table(["Field", "Column", "SQL type", "Notes"], rows), "");
  }
  const er = rd("docs/architecture.md").match(/```mermaid\n(erDiagram[\s\S]*?)\n```/);
  const ddl = [...text.get("src/db/index.ts").matchAll(/`((?:CREATE|ALTER)[^`]+)`/g)].map((m) => m[1]);
  return `${out.join("\n")}\nThe tables are created idempotently at first use by \`ensureDb()\` in \`src/db/index.ts\`. The statements it runs:\n\n${fence(ddl.join(";\n") + ";", "sql")}\n\nTwo columns, \`projects.owner_id\` and \`tasks.sub_agent\`, are added by the additive migration in the same file (\`addColumn\` checks \`PRAGMA table_info\` first). There are no foreign key constraints; \`project_id\` columns are indexed and joined in \`src/lib/repo.ts\`.\n\n${er ? "Entity relationship diagram (from the architecture document):\n\n" + fence(er[1], "mermaid") : ""}\n\n### Shared types (\`src/lib/contracts.ts\`)\n\n${fence(text.get("src/lib/contracts.ts"), "ts")}`;
}
function parseVars(css) {
  const groups = [];
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of cleaned.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const vars = [...m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((v) => [`\`${v[1]}\``, `\`${v[2].trim().replace(/\s+/g, " ")}\``]);
    if (vars.length) groups.push({ sel: m[1].trim().replace(/\s+/g, " "), vars });
  }
  return groups;
}
function genTokens() {
  const out = [];
  for (const f of ["src/app/globals.css", "src/app/ghost-kit.css"]) {
    const g = parseVars(text.get(f));
    out.push(`### Custom properties in \`${f}\``, "");
    for (const grp of g) out.push(`**\`${grp.sel}\`** (${grp.vars.length} properties)`, "", table(["Property", "Value"], grp.vars), "");
  }
  const classes = new Map();
  for (const f of ["src/app/globals.css", "src/app/ghost-kit.css"]) for (const m of text.get(f).matchAll(/^\s*\.([a-z][\w-]*)[^{\n]*\{/gm)) if (!classes.has(m[1])) classes.set(m[1], f);
  out.push("### Utility classes defined by the Ghost kit", "", table(["Class", "Defined in"], [...classes].map(([c, f]) => [`\`.${c}\``, `\`${f}\``])), "");
  out.push("### How the tokens are used", "", "- The shadcn tokens (`--background`, `--primary`, ...) are written in `oklch` for both `:root` and `.dark`. Because `src/app/layout.tsx` always sets the `dark` class on `<html>`, the dark values are the ones users see.", "- The `--gh-*` tokens carry the brand: `--gh-void` (page background), `--gh-panel` and `--gh-line` (glass panels and borders), `--gh-cyan` and `--gh-violet` (accent pair, used in `.gh-text-gradient` and the primary button gradient), `--gh-text-dim` (secondary text).", "- Fonts are three `next/font` variables (`--font-grotesk`, `--font-body`, `--font-code`) mapped to the Tailwind theme names (`--font-display`/`--font-heading`, `--font-sans`, `--font-mono`).", "- The dashboard additionally lets the user pick an accent colour (`ACCENTS` in `src/components/dashboard/store.tsx`).");
  return out.join("\n");
}
function genComponents() {
  const rows = [];
  for (const f of listed.filter((x) => x.startsWith("src/components/")).sort()) {
    const src = text.get(f);
    rows.push([`\`${f.slice("src/components/".length)}\``, detectExports(src).slice(0, 8).join(", ") || "(shadcn parts)", countLines(src), (usedBy.get(f) ?? []).length]);
  }
  const groups = {};
  for (const r of rows) { const g = r[0].replace(/`/g, "").split("/")[1] ? r[0].replace(/`/g, "").split("/")[0] : "(top level)"; (groups[g] ??= []).push(r); }
  return Object.entries(groups).map(([g, rs]) => `### ${g}\n\n${table(["File (under src/components/)", "Exports", "Lines", "Imported by (files)"], rs)}`).join("\n\n") + `\n\n**Total:** ${rows.length} component and component-data files, ${rows.reduce((s, r) => s + r[2], 0).toLocaleString("en")} lines.`;
}

const API_REF = [
  ["GET", "/api/health", "", "Liveness and database check. 200 with `{ ok, db, authEnabled }`; 503 if the database is down."],
  ["GET", "/api/openapi", "", "OpenAPI 3.1 document."],
  ["GET", "/api/stats", "", "Totals across visible projects."],
  ["GET", "/api/stack", "", "Stack catalogue grouped by category."],
  ["GET", "/api/agents", "", "All eight agents with sub-agents."],
  ["GET", "/api/agents/:name", "", "One agent, case-insensitive; 404 if unknown."],
  ["GET", "/api/projects", "", "List of ProjectDetail."],
  ["POST", "/api/projects", '{"name":"Acme Helpdesk","brief":"A ticketing app with SLA timers.","stack":["Next.js","Clerk","Postgres"]}', "Create. 201 ProjectDetail; 400 with Zod issues; 429 when rate limited."],
  ["GET", "/api/projects/:id", "", "One ProjectDetail; 404 if missing."],
  ["DELETE", "/api/projects/:id", "", "Delete. `{ ok, id }`; 403 read-only; 404."],
  ["POST", "/api/projects/:id/run", "", "Advance the simulated pipeline one step; 409 when everything is done."],
  ["GET", "/api/projects/:id/tasks?status=running&agent=Backend", "", "Task list; filters status, module, agent."],
  ["PATCH", "/api/projects/:id/tasks/:taskId", '{"status":"review","progress":80}', "Update a task; returns the updated ProjectDetail."],
  ["GET", "/api/projects/:id/gitlog?limit=20&agent=QA", "", "Commit list, newest first; limit 1-500."],
  ["GET", "/api/projects/:id/export?format=md", "", "Download the project as json or md."],
];
function genApiRef() {
  const out = ["All examples assume the server runs on `http://localhost:3000` (`npm run dev`). Replace `PROJECT_ID` with an id from `GET /api/projects`. With Clerk enabled, add the session cookie or token; reads stay public.", ""];
  const checkRoutes = genRoutes().api.length;
  for (const [m, p, body, desc] of API_REF) {
    out.push(`### \`${m} ${p.split("?")[0]}\``, "", desc, "");
    const url = `http://localhost:3000${p.replace(":id", "PROJECT_ID").replace(":taskId", "TASK_ID").replace(":name", "architect")}`;
    out.push(fence(`curl -s ${m === "GET" ? "" : `-X ${m} `}${body ? `-H "Content-Type: application/json" -d '${body}' ` : ""}"${url}"`, "bash"), "");
  }
  out.push(`The route table above covers ${API_REF.length} method-and-path combinations over ${checkRoutes} route files; \`OPTIONS\` is available on every path.`, "", "### Response and error shapes", "", "Success responses are the types in `src/lib/contracts.ts` serialised as JSON. Errors always use one envelope:", "", fence('{ "error": { "code": "invalid_input", "message": "Invalid input", "issues": [ ... ] } }', "json"), "", table(["Status", "Code", "When"], [[400, "invalid_json / invalid_input", "Body is not JSON or fails Zod validation"], [401, "unauthorized", "Clerk enabled, no session, write to /api/projects*"], [403, "(forbidden)", "Deleting a read-only demo project"], [404, "not_found", "Unknown project, task or agent"], [409, "(conflict)", "Run requested after all tasks are done"], [429, "rate_limited", "More than 60 writes per minute from one IP"], [500, "internal_error", "Unexpected failure; details only in server logs"]]), "", "The status-code list is taken from `docs/methods.md`, `src/lib/api-utils.ts` and `tests/e2e/api.spec.ts`; codes in parentheses are not confirmed by name in the source I read for this table.");
  return out.join("\n");
}

const ENV_DESC = {
  NEXT_PUBLIC_DEMO: "Set to `1` for demo mode: no Clerk, mock data in the browser. Used for the static Pages build and in CI builds.",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk publishable key. Presence (with demo off) enables authentication.",
  CLERK_SECRET_KEY: "Clerk secret key, server only.",
  DATABASE_URL: "libSQL URL. Default `file:local.db`; Docker uses `file:/data/local.db`; Turso uses a `libsql://` URL.",
  DATABASE_AUTH_TOKEN: "Auth token for a remote libSQL/Turso database.",
  GITHUB_PAGES: "`true` switches `next.config.ts` to static export and disables cacheComponents/partialPrefetching.",
  NEXT_PUBLIC_BASE_PATH: "Base path for a project site on GitHub Pages, e.g. `/ghost-ai`.",
  DOCKER: "`1` makes Next emit `output: standalone` for the Docker image.",
  NODE_ENV: "Standard Node environment flag; `production` in the Docker runner.",
  PORT: "Port the standalone server listens on (Docker: 3000).",
  HOSTNAME: "Bind address of the standalone server (Docker: 0.0.0.0).",
  NEXT_TELEMETRY_DISABLED: "Disables Next.js telemetry in Docker builds.",
  PUPPETEER_EXECUTABLE_PATH: "Chrome or Edge executable for Mermaid rendering and this book's PDF.",
  CHROME_PATH: "Alternative Chrome path for Mermaid rendering.",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "Clerk sign-in route (`/sign-in`); documented in `docs/auth.md`.",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "Clerk sign-up route (`/sign-up`).",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "Where to land after sign-in (`/dashboard`).",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "Where to land after sign-up (`/dashboard`).",
};
function genEnv() {
  const found = new Map();
  for (const [f, src] of text) {
    if (f.startsWith("docs/book/")) continue;
    for (const m of src.matchAll(/process\.env\.([A-Z][A-Z0-9_]+)|process\.env\[["']([A-Z][A-Z0-9_]+)["']\]/g)) { const n = m[1] ?? m[2]; found.set(n, new Set([...(found.get(n) ?? []), f])); }
  }
  for (const [f, src] of text) if (/Dockerfile|docker-compose|\.yml$/.test(f)) for (const m of src.matchAll(/\b([A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+)\s*[:=]/g)) if (ENV_DESC[m[1]]) found.set(m[1], new Set([...(found.get(m[1]) ?? []), f]));
  for (const k of Object.keys(ENV_DESC)) if (!found.has(k)) found.set(k, new Set(["docs/auth.md"]));
  const rows = [...found].sort((a, b) => a[0].localeCompare(b[0])).map(([k, fs_]) => [`\`${k}\``, ENV_DESC[k] ?? "(no description recorded)", [...fs_].slice(0, 4).map((x) => `\`${x}\``).join(", ") + (fs_.size > 4 ? ` +${fs_.size - 4}` : "")]);
  return `Variables detected by scanning \`process.env.*\` in every tracked text file, plus compose/workflow settings. Secrets belong in \`.env.local\` (git-ignored; \`.env*\` is in \`.gitignore\`), the host's secret store or \`docker run -e\`, never in the image.\n\n${table(["Variable", "Meaning", "Used in"], rows)}`;
}
function genTroubleshooting() {
  const g = text.get("src/components/marketing/guides.ts");
  const items = [...g.matchAll(/\{\s*h:\s*"([^"]+)",\s*p:\s*"([^"]+)"\s*\}/g)].map((m) => [m[1], m[2]]);
  const runme = rd("docs/RUN-ME.md");
  const tbl = runme.match(/\| Symptom \| Why \| Fix \|[\s\S]*?\n\n/)?.[0].trim() ?? "";
  return `### From the run guide (\`docs/RUN-ME.md\`)\n\n${tbl}\n\n### From the in-app troubleshooting guide (\`src/components/marketing/guides.ts\`)\n\n${items.length ? table(["Problem", "Advice"], items) : "_not found_"}\n\n### Additional entries learned during the build\n\n${table(["Symptom", "Likely cause", "Fix"], [["Static build fails or API 404s after `build:pages` crashed", "Files left in `.pages-stash`", "Move `.pages-stash/api` back to `src/app/api` and `.pages-stash/proxy.ts` to `src/proxy.ts`, delete `.pages-stash`"], ["Exported site requests `__next.*.__PAGE__.txt` and gets 404 (Windows)", "Nested prefetch files", "`node scripts/fix-win-export.mjs out` (done automatically by `pages-build.mjs`)"], ["Base path looks like `C:/Program Files/Git/...`", "Git Bash converted `/ghost-ai` into a Windows path", "Use PowerShell or `MSYS_NO_PATHCONV=1`"], ["Text is serif despite loaded fonts", "A `--font-*` variable referring to itself", "Keep `next/font` variable names distinct from theme tokens (see Chapter 4)"], ["`npx dockerfilelint` flags HEALTHCHECK", "Outdated linter does not know `--start-period`", "Ignore; verify with a real `docker build` in CI"], ["Playwright cannot start", "Edge missing", "`channel: \"msedge\"` needs Microsoft Edge installed; otherwise remove the channel and run `npx playwright install chromium`"]])}`;
}

// ---------------------------------------------------------------- checks (Part V)
function captureChecks() {
  const cacheFile = path.join(CACHE, "checks.json");
  if (args.has("--no-checks") && exists(cacheFile)) return JSON.parse(rd(cacheFile));
  const c = {};
  log("running tsc --noEmit"); c.tsc = run("npx", ["tsc", "--noEmit"]);
  log("running eslint"); c.eslint = run("npx", ["eslint"]);
  log("running playwright --list"); c.pwList = run("npx", ["playwright", "test", "--list"]);
  log("running check-mermaid --no-render"); c.mermaid = run(`"${process.execPath}"`, ["scripts/check-mermaid.mjs", "--no-render"]);
  c.versions = { node: process.version, platform: `${os.type()} ${os.release()} (${process.platform})`, next: packageJson.dependencies.next, typescript: run("npx", ["tsc", "-v"]).out.trim(), playwright: run("npx", ["playwright", "--version"]).out.trim(), edge: fs.readdirSync("C:/Program Files (x86)/Microsoft/Edge/Application").find((d) => /^\d+\./.test(d)) ?? "n/a" };
  fs.writeFileSync(cacheFile, JSON.stringify(c, null, 1));
  return c;
}
function yamlReport() {
  const rows = [];
  for (const f of allFiles.filter((x) => /^(\.github\/(workflows|ISSUE_TEMPLATE)\/.*\.yml|\.github\/dependabot\.yml|\.coderabbit\.yaml|docker-compose\.yml)$/.test(x))) {
    try {
      const d = (jsyaml.load ?? jsyaml.default.load)(text.get(f));
      const jobs = d?.jobs ? Object.keys(d.jobs).map((j) => `${j} (${d.jobs[j].steps?.length ?? 0} steps)`).join(", ") : "";
      rows.push([`\`${f}\``, "parses", Object.keys(d ?? {}).join(", "), jobs]);
    } catch (e) { rows.push([`\`${f}\``, `**ERROR** ${String(e.message).split("\n")[0]}`, "", ""]); }
  }
  return table(["File", "YAML parse (js-yaml)", "Top-level keys", "Jobs"], rows);
}
function genExecutionLog(chk) {
  const tail = (s, n = 25) => { const l = s.trim().split("\n"); return (l.length > n ? ["... (" + (l.length - n) + " earlier lines omitted)", ...l.slice(-n)] : l).join("\n") || "(no output)"; };
  const pw = chk.pwList.out.split("\n").map((l) => l.trim()).filter((l) => /^\S+\.spec\.ts:\d+:\d+ ›/.test(l));
  const byFile = {};
  for (const l of pw) { const f = l.split(":")[0]; (byFile[f] ??= []).push(l.replace(/^\S+\.spec\.ts:\d+:\d+ › /, "")); }
  const status = rd("STATUS.md");
  const sect = (name) => status.match(new RegExp(`## ${name}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`))?.[1].trim() ?? "";
  const out = [];
  out.push("## Environment", "", table(["Item", "Value"], [["Node.js", chk.versions.node], ["OS", chk.versions.platform], ["Next.js (package.json)", chk.versions.next], ["TypeScript", chk.versions.typescript], ["Playwright", chk.versions.playwright], ["Microsoft Edge", chk.versions.edge], ["Shells", "PowerShell and Git Bash on Windows 11"], ["Docker, ffmpeg, gh", "not installed"]]), "");
  out.push("## Commands re-run while building this book", "", "The generator runs these itself, so the outcomes below are real and dated by the build (see the front page for the commit).", "");
  out.push(table(["Command", "Exit code", "Seconds", "Result"], [["`npx tsc --noEmit` (`npm run typecheck`)", chk.tsc.code, (chk.tsc.ms / 1000).toFixed(1), chk.tsc.code === 0 ? "clean, no output" : "errors, see below"], ["`npx eslint` (`npm run lint`)", chk.eslint.code, (chk.eslint.ms / 1000).toFixed(1), chk.eslint.code === 0 ? "clean, no output" : "findings, see below"], ["`npx playwright test --list`", chk.pwList.code, (chk.pwList.ms / 1000).toFixed(1), `${pw.length} tests listed in ${Object.keys(byFile).length} files (lists only; does not start the server or run the tests)`], ["`node scripts/check-mermaid.mjs --no-render` (`npm run docs:check`)", chk.mermaid.code, (chk.mermaid.ms / 1000).toFixed(1), chk.mermaid.out.trim().split("\n").pop()]]), "");
  for (const [n, k] of [["tsc", "tsc"], ["eslint", "eslint"], ["check-mermaid", "mermaid"]]) out.push(`Output of ${n}:`, "", fence(tail(chk[k].out), "text"), "");
  out.push("### Mermaid rendering done for this book", "", `${mermaidStats.blocks} Mermaid blocks in the inlined documents: ${mermaidStats.rendered} rendered fresh with mermaid-cli and Edge, ${mermaidStats.cached} reused from the render cache (keyed by a hash of the diagram source), ${mermaidStats.fromDiagramsDir} taken from \`docs/diagrams/\`, ${mermaidStats.failed} unavailable.`, "");
  out.push("### Playwright test inventory (`npx playwright test --list`)", "", `${pw.length} tests in ${Object.keys(byFile).length} files. The configuration (\`playwright.config.ts\`) uses one worker, the \`msedge\` channel, a production server on port 3500 started with \`next start\`, and a global teardown. Every test also fails on uncaught page errors or console errors (see \`tests/e2e/fixtures.ts\`).`, "");
  for (const [f, names] of Object.entries(byFile)) out.push(`**\`tests/e2e/${f}\`** (${names.length} tests)`, "", names.map((n, i) => `${i + 1}. ${n}`).join("\n"), "");
  out.push("## Results recorded in STATUS.md (not re-run for this book)", "", "These came from the orchestrator's runs against a production build and a server. Running them needs `next build` and a server, which this book's generator deliberately does not do.", "", "### Verified (with evidence), as stated in `STATUS.md`", "", sect("Verified"), "", "### Not verified, as stated in `STATUS.md`", "", sect("NOT verified"), "");
  out.push("## Workflow and configuration validation", "", "Every YAML file below was parsed again by this build with `js-yaml`. `STATUS.md` additionally records that the workflow files and `.coderabbit.yaml` were validated against their JSON schemas with `ajv-cli`; that schema check was not repeated for the book.", "", yamlReport(), "");
  out.push("## Dockerfile static lint", "", "Command: `npx --yes dockerfilelint Dockerfile`. The complete real output, saved in `docs/book/docker-lint.txt`:", "", fence(exists(`${BOOK}/docker-lint.txt`) ? rd(`${BOOK}/docker-lint.txt`) : "(docker-lint.txt not present)", "text"), "", "Reading the result: the single issue points at the `HEALTHCHECK` instruction. `--interval`, `--timeout`, `--retries` and `--start-period` are valid `HEALTHCHECK` options in current Docker (`--start-period` since 17.09), so this is most likely a limitation of the old linter's argument parser rather than a defect, but only a real `docker build` can confirm it, and Docker is not installed on the development machine. CI builds the image on every pull request.", "");
  out.push("## Command reference used during the build", "", table(["Purpose", "Command", "Evidence"], [["Install", "`npm ci`", "used by CI and Docker"], ["Dev server", "`npm run dev`", "interactive use"], ["Type check", "`npm run typecheck`", "re-run above"], ["Lint", "`npm run lint`", "re-run above"], ["Production build", "`npm run build` (47 static pages, 13 API routes, proxy)", "STATUS.md"], ["Static Pages build", "`$env:NEXT_PUBLIC_BASE_PATH='/ghost-ai'; node scripts/pages-build.mjs` (PowerShell)", "STATUS.md; flattened files by fix-win-export"], ["Static smoke test", "`node scripts/static-smoke.mjs`", "described in the header of the script; result summarised by STATUS.md"], ["E2E tests", "`npx playwright test` (starts `next start -p 3500`)", "STATUS.md: 55/55 passed on Edge"], ["Test inventory", "`npx playwright test --list`", "re-run above"], ["Diagram check", "`npm run docs:check` / `npm run docs:diagrams`", "re-run above; 19 diagrams per STATUS.md"], ["Demo recording", "`npm run demo:record`", "STATUS.md: webm of about 11 MB, 89 s"], ["Docker", "`npm run docker:build`, `docker compose up --build`", "NOT run (no Docker)"], ["Dockerfile lint", "`npx --yes dockerfilelint Dockerfile`", "run, see above"], ["This book", "`node scripts/build-book.mjs` (`npm run docs:book`)", "this document"]]), "");
  out.push("## What was NOT verified", "", "State this plainly, because a long document can make everything in it sound checked:", "", table(["Not verified", "Why", "What would verify it"], [["Real Clerk sign-in with email and GitHub", "Needs the owner's Clerk keys", "Add keys to `.env.local`, follow `docs/auth.md`, sign in and out"], ["Docker image build and run", "Docker is not installed locally", "`docker compose up --build`, or the CI `docker` job"], ["GitHub Actions runs (CI, CodeQL, Pages)", "Repository has not been pushed", "Push, and watch the Actions tab"], ["GitHub Pages deployment and live URL", "Same", "Enable Pages with source GitHub Actions"], ["CodeRabbit reviews", "App not installed on a pushed repo", "Install the app and open a PR"], ["Browsers other than Edge; Linux static export", "Only Edge on Windows was available", "Run Playwright in CI with more projects"], ["Screen-reader behaviour and visual regressions", "Tests check basics (landmarks, console errors, overflow), not rendering", "Manual review or visual snapshot tests"], ["Production load, real database (Turso)", "Local SQLite only", "Deploy to Vercel with Turso"], ["This book's PDF layout beyond sampled pages", "Only a few pages were rendered to images and inspected", "Page through the PDF"]]), "");
  return out.join("\n");
}

function genFileIndex() {
  const rows = [];
  for (const g of SOURCE_GROUPS) for (const f of g.files) rows.push([`\`${f}\``, g.title, countLines(text.get(f))]);
  return `All ${rows.length} files listed in Part III, alphabetically, with their chapter. The paths link to their listing.\n\n${table(["File", "Chapter", "Lines"], rows.sort((a, b) => a[0].localeCompare(b[0])))}`;
}

// ---------------------------------------------------------------- Part III groups
const ORDER_HINT = ["src/lib/contracts.ts", "src/lib/agent-catalog.ts", "src/lib/stack-catalog.ts", "src/lib/mock-data.ts", "src/lib/sim.ts", "src/lib/utils.ts", "src/db/schema.ts", "src/db/index.ts", "src/lib/api-utils.ts", "src/lib/auth.ts", "src/lib/repo.ts", "src/lib/openapi.ts", "src/lib/export.ts", "src/lib/client-data.ts", "src/proxy.ts", "package.json", "next.config.ts", "tsconfig.json", "eslint.config.mjs", "playwright.config.ts", "drizzle.config.ts", "components.json", "Dockerfile", "docker-compose.yml", "README.md", "STATUS.md"];
const hintIdx = (f) => { const i = ORDER_HINT.indexOf(f); return i < 0 ? 1e6 : i; };
const SOURCE_GROUPS_DEF = [
  ["Root configuration, containers and tooling", (f) => !f.includes("/") && !f.endsWith(".md"), "The files at the repository root that configure the toolchain: package manifest, TypeScript, ESLint, Next.js, Drizzle, shadcn, Playwright, Docker, Vercel, CodeRabbit and ignore rules."],
  ["Root documents", (f) => !f.includes("/") && f.endsWith(".md"), "The Markdown documents at the repository root. The `docs/` folder is reproduced in Part II."],
  ["GitHub automation and templates", (f) => f.startsWith(".github/"), "Workflows (CI, CodeQL, Pages), Dependabot, code owners and the issue and pull request templates."],
  ["Scripts", (f) => f.startsWith("scripts/"), "Node scripts for the static Pages build, the Windows export workaround, smoke testing, demo recording, Mermaid checking and this book."],
  ["Shared library and data layer", (f) => f.startsWith("src/lib/") || f.startsWith("src/db/") || f === "src/proxy.ts", "The contracts, catalogues, simulation, data-access code and request plumbing that the pages, components and API routes share. Read `contracts.ts` first."],
  ["API route handlers", (f) => f.startsWith("src/app/api/"), "The thirteen JSON endpoints. They are intentionally thin: validate, call `repo.ts`, shape the response."],
  ["App shell, styles and public pages", (f) => f.startsWith("src/app/") && !f.startsWith("src/app/api/") && !f.startsWith("src/app/dashboard/"), "The root layout, the home page, global CSS, the auth routes and the marketing routes."],
  ["Dashboard routes", (f) => f.startsWith("src/app/dashboard/"), "Thin route files that mount the dashboard views inside the dashboard layout."],
  ["Components: UI primitives, brand and auth", (f) => /^src\/components\/(ui|brand|auth)\//.test(f) || f === "src/components/auth-provider.tsx", "shadcn/ui primitives, the logo, and the lazily loaded Clerk integration."],
  ["Components: site chrome", (f) => f.startsWith("src/components/site/"), "Header, footer, mobile navigation and the page shell."],
  ["Components: landing page", (f) => f.startsWith("src/components/landing/"), "The sections of the home page."],
  ["Components: marketing pages", (f) => f.startsWith("src/components/marketing/"), "Building blocks and data for the marketing and documentation pages."],
  ["Components: dashboard", (f) => f.startsWith("src/components/dashboard/"), "The state store, the shell and the eight dashboard views."],
  ["Tests", (f) => f.startsWith("tests/"), "The Playwright end-to-end suite."],
  ["Public assets", (f) => f.startsWith("public/"), "SVG assets (binary demo media is excluded)."],
  ["Book generator inputs", (f) => f.startsWith("docs/book/"), "The per-file notes that feed this book and the saved Dockerfile lint output."],
];
const SOURCE_GROUPS = [];
{
  const taken = new Set();
  for (const [title, test, intro] of SOURCE_GROUPS_DEF) {
    const files = listed.filter((f) => !taken.has(f) && test(f)).sort((a, b) => hintIdx(a) - hintIdx(b) || a.localeCompare(b));
    files.forEach((f) => taken.add(f));
    if (files.length) SOURCE_GROUPS.push({ title, intro, files });
  }
  const left = listed.filter((f) => !taken.has(f));
  if (left.length) SOURCE_GROUPS.push({ title: "Other files", intro: "Files not matched by another group.", files: left });
}
const missingNotes = [];
function genFileEntry(f) {
  const src = text.get(f);
  const lines = countLines(src);
  const ex = detectExports(src);
  const r = routeOf(f);
  const meta = [`**Lines:** ${lines}`, `**Size:** ${fmtKB(Buffer.byteLength(src))}`, `**Language:** ${langOf(f)}`];
  if (ex.length) meta.push(`**Exports:** ${ex.slice(0, 12).map((e) => `\`${e}\``).join(", ")}${ex.length > 12 ? ` +${ex.length - 12}` : ""}`);
  if (r) meta.push(r.kind === "api" ? `**Route:** ${methodsOf(src).join(", ")} \`${r.url}\`` : `**Page route:** \`${r.url}\``);
  const imps = (importsOf.get(f) ?? []).filter((x) => x !== f);
  const used = usedBy.get(f) ?? [];
  let note = notes[f];
  if (!note) { missingNotes.push(f); note = `(No hand-written note for this file. Detected exports: ${ex.join(", ") || "none"}.)`; }
  const rel = [];
  if (imps.length) rel.push(`**Imports from:** ${imps.slice(0, 8).map((x) => `\`${x}\``).join(", ")}${imps.length > 8 ? ` +${imps.length - 8} more` : ""}`);
  if (used.length) rel.push(`**Used by:** ${used.slice(0, 6).map((x) => `\`${x}\``).join(", ")}${used.length > 6 ? ` +${used.length - 6} more` : ""}`);
  return `### \`${f}\`\n\n${meta.join(" · ")}\n\n${note}\n\n${rel.join("\n\n")}${rel.length ? "\n\n" : ""}${fence(src, fenceLang(f))}`;
}

// ---------------------------------------------------------------- assemble chapters
const chapters = []; // {id,title,level,md,numbered?,dir?}
const addCh = (c) => chapters.push(c);
const chapterFiles = new Map(); // repo path -> chapter index (for link resolution)
let chNo = 0;
const NUM = () => ++chNo;
function expandDirectives(md) {
  return md
    .replace(/\{\{doc:([^}]+)\}\}/g, (_, p) => demote(rd(p), 2, true))
    .replace(/\{\{gen:roles_table\}\}/g, genRolesTable)
    .replace(/\{\{gen:subagent_table\}\}/g, genSubagentTable);
}
const chapterMd = (file, title, extraDemote = 1) => {
  const body = demote(expandDirectives(rd(file)), extraDemote, true);
  return `## ${title}\n\n${body}`;
};

function buildChapters(chk) {
  const partIntro = {
    I: "What was built, in what order, by which agents, and what went wrong along the way.",
    II: "How the system is put together, and the project's own documentation, reproduced in full.",
    III: "Every tracked source and configuration file, with a note on what it is and how it connects, followed by the complete listing.",
    IV: "Where everything is: directory tree, routes, data model, design tokens, components, agent and stack catalogues, and the API reference.",
    V: "The commands that were run, what they printed, and what has not been verified.",
    A: "Reference material: environment variables, troubleshooting, glossary, license note, changelog and a file index.",
  };
  const part = (n, title) => addCh({ id: "", title: `Part ${n}. ${title}`, level: 1, md: `# Part ${n}. ${title}\n\n${partIntro[n]}\n\n{{partlist}}` });

  addCh({ id: "", title: "How to read this book", level: 2, md: chapterMd(`${BOOK}/chapters/00-how-to-read.md`, "How to read this book"), front: true });

  part("I", "The story");
  addCh({ title: `${NUM()}. The product brief`, level: 2, md: chapterMd(`${BOOK}/chapters/01-brief.md`, `${chNo}. The product brief`), dir: `${BOOK}/chapters` });
  addCh({ title: `${NUM()}. Multi-agent orchestration`, level: 2, md: chapterMd(`${BOOK}/chapters/02-orchestration.md`, `${chNo}. Multi-agent orchestration`) });
  addCh({ title: `${NUM()}. The build timeline`, level: 2, md: `## ${chNo}. The build timeline\n\n${genTimeline()}` });
  addCh({ title: `${NUM()}. Problems hit and how they were solved`, level: 2, md: chapterMd(`${BOOK}/chapters/04-problems.md`, `${chNo}. Problems hit and how they were solved`) });

  part("II", "Architecture and design");
  const docChapters = [
    ["docs/context.md", "Context"], ["docs/prose.md", "Ghost AI in plain words"], ["docs/architecture.md", "Architecture"], ["docs/connectivity.md", "Connectivity"], ["docs/methods.md", "Methods and API summary"], ["docs/logs.md", "Logs and conventions"], ["docs/agents.md", "Agents"], ["docs/auth.md", "Authentication"], ["docs/devops.md", "DevOps guide"], ["docs/coderabbit.md", "CodeRabbit"], ["docs/adr/0001-stack.md", "ADR 0001: Technology stack"], ["docs/CODE-TOUR.md", "Code tour"], ["docs/RUN-ME.md", "Run me"], ["docs/EXPLAIN-LIKE-IM-5.md", "Explain like I'm 5"], ["docs/COMMANDS.md", "Commands"], ["docs/WORKFLOWS.md", "Workflows"], ["docs/README.md", "Documentation index"],
  ];
  for (const [f, t] of docChapters) {
    const src = rd(f);
    addCh({ title: `${NUM()}. ${t}`, level: 2, doc: f, md: `## ${chNo}. ${t}\n\n*Source: \`${f}\` (${countLines(src)} lines), reproduced in full.*\n\n${demote(src, 1, true)}` });
  }

  part("III", "Complete source code");
  addCh({ title: `${NUM()}. How to read the listings`, level: 2, md: `## ${chNo}. How to read the listings\n\nPart III covers **${listed.length} files** (${listed.reduce((s, f) => s + countLines(text.get(f)), 0).toLocaleString("en")} lines). Excluded on purpose: \`package-lock.json\` (generated), \`public/demo/*\` (binary video and poster), \`docs/diagrams/*.svg\` (generated renderings of the diagrams in Part II), and \`docs/*.md\` (reproduced in Part II).\n\nEach entry has: the path; line count and size; the language; exports and routes detected from the text; a note written by reading the file (kept in \`docs/book/file-notes.json\`); the files it imports and the files that use it (resolved from import statements, including the \`@/\` alias); and then the complete source with line numbers.\n\n${table(["Chapter", "Files", "Lines"], SOURCE_GROUPS.map((g) => [g.title, g.files.length, g.files.reduce((s, f) => s + countLines(text.get(f)), 0).toLocaleString("en")]))}` });
  for (const g of SOURCE_GROUPS) {
    addCh({ title: `${NUM()}. ${g.title}`, level: 2, numbered: true, md: `## ${chNo}. ${g.title}\n\n${g.intro}\n\n${g.files.map(genFileEntry).join("\n\n")}` });
  }

  part("IV", "Layout and structure");
  const routes = genRoutes();
  addCh({ title: `${NUM()}. Directory tree`, level: 2, md: `## ${chNo}. Directory tree\n\nEvery tracked path (plus this book's own inputs), with line counts for text files. Binary files and the lockfile show no count.\n\n${genTree()}` });
  addCh({ title: `${NUM()}. Route map`, level: 2, md: `## ${chNo}. Route map\n\nDerived from the file system: \`page.tsx\` files become pages (route groups in parentheses disappear from the URL), \`route.ts\` files become API endpoints.\n\n${routes.md}` });
  addCh({ title: `${NUM()}. Data model`, level: 2, md: `## ${chNo}. Data model\n\n${genDataModel()}` });
  addCh({ title: `${NUM()}. Design-token reference`, level: 2, md: `## ${chNo}. Design-token reference\n\n${genTokens()}` });
  addCh({ title: `${NUM()}. Component inventory`, level: 2, md: `## ${chNo}. Component inventory\n\n${genComponents()}` });
  addCh({ title: `${NUM()}. Agent and stack catalogues`, level: 2, md: `## ${chNo}. Agent and stack catalogues\n\n### The eight agents (\`src/lib/agent-catalog.ts\`)\n\n${genAgentCatalogTable()}\n\n### Sub-agents\n\n${genSubagentTable()}\n\n### Stack catalogue (\`src/lib/stack-catalog.ts\`)\n\n${genStackTable()}` });
  addCh({ title: `${NUM()}. API reference with curl examples`, level: 2, md: `## ${chNo}. API reference with curl examples\n\n${genApiRef()}` });

  part("V", "Execution log");
  addCh({ title: `${NUM()}. What was run and what happened`, level: 2, md: `## ${chNo}. What was run and what happened\n\n${genExecutionLog(chk)}` });

  part("A", "Appendices");
  addCh({ title: "A. Environment variable reference", level: 2, md: `## A. Environment variable reference\n\n${genEnv()}` });
  addCh({ title: "B. Troubleshooting", level: 2, md: `## B. Troubleshooting\n\n${genTroubleshooting()}` });
  addCh({ title: "C. Glossary", level: 2, md: chapterMd(`${BOOK}/chapters/glossary.md`, "C. Glossary (kid-friendly)") });
  addCh({ title: "D. License note", level: 2, md: `## D. License note\n\nThe repository contains **no \`LICENSE\` file** ${tracked.some((f) => /^LICENSE/i.test(f)) ? "(unexpected: one was found, check the repository)" : "(confirmed by the file list)"}, and \`package.json\` is marked \`"private": true\`. The project's changelog lists "No \`LICENSE\` file yet" under known gaps. Until the owner chooses one, the code is "all rights reserved" by default and nobody else has permission to reuse it. Choosing a license (MIT and Apache-2.0 are common for web projects) is a decision for the owner and is not made in this book.\n\nThird-party software keeps its own licenses; this book embeds no third-party source beyond the shadcn/ui component files that the project copied into \`src/components/ui\`.` });
  addCh({ title: "E. Changelog", level: 2, md: `## E. Changelog\n\n### Project changelog (\`CHANGELOG.md\`)\n\n${demote(rd("CHANGELOG.md"), 2, true)}\n\n### Commit history\n\n${table(["Commit", "Date", "Message"], commits.map((c) => [`\`${c.short}\``, c.date.slice(0, 10), c.subject]))}\n\nThe full per-commit file lists are in Chapter 3.` });
  addCh({ title: "F. File index", level: 2, md: `## F. File index\n\n${genFileIndex()}` });

  // numbering/ids happen in assignIds
}

// ---------------------------------------------------------------- ids and rendering
const fileAnchors = new Map(); // repo path -> id
const docChapterId = new Map(); // repo path -> chapter id
function assignIds() {
  const used = new Map();
  const uniq = (base) => { const n = used.get(base) ?? 0; used.set(base, n + 1); return n === 0 ? base : `${base}-${n}`; };
  const plain = (t) => t.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*]/g, "").replace(/<[^>]+>/g, "");
  for (const ch of chapters) {
    ch.ids = [];
    ch.localIds = new Map();
    const toks = marked.lexer(ch.md.replace(/\{\{partlist\}\}/g, ""));
    let first = true;
    marked.walkTokens(toks, (t) => {
      if (t.type !== "heading") return;
      const txt = plain(t.text);
      const id = uniq(ghSlug(txt));
      ch.ids.push(id);
      if (first) { ch.id = id; first = false; }
      if (!ch.localIds.has(ghSlug(txt))) ch.localIds.set(ghSlug(txt), id);
      if (ch.numbered && t.depth === 3 && !fileAnchors.has(txt)) fileAnchors.set(txt, id);
    });
    if (ch.doc) docChapterId.set(ch.doc, ch.id);
  }
}

function highlightLines(code, lang) {
  let html;
  try { html = lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value : esc(code); } catch { html = esc(code); }
  const lines = [];
  let cur = "";
  const stack = [];
  for (const m of html.matchAll(/<span[^>]*>|<\/span>|\n|[^<\n]+/g)) {
    const t = m[0];
    if (t === "\n") { lines.push(cur + "</span>".repeat(stack.length)); cur = stack.join(""); }
    else if (t.startsWith("<span")) { stack.push(t); cur += t; }
    else if (t === "</span>") { stack.pop(); cur += t; }
    else cur += t;
  }
  lines.push(cur + "</span>".repeat(stack.length));
  if (lines.length > 1 && lines.at(-1).replace(/<[^>]*>/g, "") === "") lines.pop();
  return lines;
}
const HL_ALIAS = { ts: "typescript", tsx: "typescript", js: "javascript", mjs: "javascript", sh: "bash", shell: "bash", yml: "yaml", ps1: "powershell", text: "plaintext", txt: "plaintext", jsonc: "json", html: "xml", svg: "xml", sql: "sql", docker: "dockerfile" };
const ctx = { chapter: null, queue: [], numbered: false, dir: "" };

function setupMarked() {
  marked.setOptions({ gfm: true, mangle: false, headerIds: false, breaks: false });
  const tokText = function (a) { return typeof a === "object" ? this.parser.parseInline(a.tokens) : a; };
  marked.use({
    renderer: {
      heading(a, b) {
        const level = typeof a === "object" ? a.depth : b;
        const html = typeof a === "object" ? this.parser.parseInline(a.tokens) : a;
        const id = ctx.queue.shift() ?? "";
        return `<h${level} id="${id}">${html}</h${level}>\n`;
      },
      code(a, b) {
        const code = typeof a === "object" ? a.text : a;
        const info = (typeof a === "object" ? a.lang : b) ?? "";
        const lang0 = info.split(/\s+/)[0].toLowerCase();
        if (lang0 === "mermaid") {
          const svg = mermaidSvg.get(code.trim());
          return svg ? `<figure class="fig">${svgToImg(svg)}</figure>\n` : `<pre class="code"><code><span class="l">[diagram unavailable: ${mermaidStats.failed} failed]</span></code></pre>\n`;
        }
        const lang = HL_ALIAS[lang0] ?? lang0;
        const lines = highlightLines(code.replace(/\n$/, ""), lang);
        return `<pre class="code${ctx.numbered ? " num" : ""}"><code>${lines.map((l) => `<span class="l">${l === "" ? "&#8203;" : l}</span>`).join("")}</code></pre>\n`;
      },
      link(a, b, c) {
        let href = typeof a === "object" ? a.href : a;
        const title = typeof a === "object" ? a.title : b;
        const text = typeof a === "object" ? this.parser.parseInline(a.tokens) : c;
        if (/^(https?:|mailto:)/i.test(href)) return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}>${text}</a>`;
        if (href.startsWith("#")) { const id = ctx.chapter?.localIds?.get(href.slice(1)); return `<a href="#${id ?? ctx.chapter?.id ?? ""}">${text}</a>`; }
        const clean = href.split("#")[0];
        const target = path.posix.normalize(path.posix.join(ctx.dir || ".", clean));
        const id = docChapterId.get(target) ?? fileAnchors.get(target);
        return id ? `<a href="#${id}">${text}</a>` : `<span class="deadlink">${text}</span>`;
      },
      image(a, b, c) {
        const href = typeof a === "object" ? a.href : a;
        const alt = (typeof a === "object" ? a.text : c) ?? "";
        const p = path.posix.normalize(path.posix.join(ctx.dir || ".", href));
        if (!/^https?:/.test(href) && exists(p)) {
          const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".gif": "image/gif" }[path.extname(p).toLowerCase()] ?? "application/octet-stream";
          return `<figure class="fig"><img class="shot" alt="${esc(alt)}" src="data:${mime};base64,${fs.readFileSync(p).toString("base64")}"><figcaption>${esc(alt)}</figcaption></figure>`;
        }
        return `<em>[image: ${esc(alt)}]</em>`;
      },
    },
  });
  void tokText;
}
function renderChapter(ch, partList) {
  ctx.chapter = ch;
  ctx.queue = [...ch.ids];
  ctx.numbered = !!ch.numbered;
  ctx.dir = ch.title.startsWith("1. The product brief") ? BOOK : ch.doc ? path.posix.dirname(ch.doc) : ".";
  const md = ch.md.replace(/\{\{partlist\}\}/g, partList ?? "");
  return marked.parse(md);
}

// ---------------------------------------------------------------- CSS / HTML
const CSS = `
@page { size: A4; margin: 20mm 16mm 22mm 16mm;
  @top-center { content: "Building Ghost AI from Scratch"; font: 8pt "Segoe UI", Arial, sans-serif; color: #6b7280; }
  @bottom-center { content: counter(page); font: 9pt "Segoe UI", Arial, sans-serif; color: #374151; } }
@page :first { @top-center { content: none; } @bottom-center { content: none; } }
:root { --ink:#111827; --dim:#4b5563; --cyan:#0e7490; --violet:#6d28d9; --line:#d1d5db; --soft:#f3f4f6; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; background:#fff; color:var(--ink); font: 10pt/1.45 "Segoe UI", "Helvetica Neue", Arial, sans-serif; overflow-wrap:anywhere; }
.piece + .piece { break-before: page; }
h1,h2,h3,h4,h5,h6 { break-after: avoid; line-height:1.2; margin:1.2em 0 .45em; }
h1 { font-size: 30pt; margin-top: 70mm; color: var(--violet); border-bottom: 3px solid var(--cyan); padding-bottom: 6mm; }
h2 { font-size: 20pt; color: var(--cyan); border-bottom: 1.5px solid var(--line); padding-bottom: 2mm; margin-top: 0; }
h3 { font-size: 13pt; color: var(--violet); } h4 { font-size: 11pt; } h5,h6 { font-size: 10pt; }
h3 > code { font-size: 11pt; background: none; color: var(--violet); padding:0; border:0; word-break: break-all; }
p { margin: .5em 0; orphans:3; widows:3; } ul,ol { margin:.4em 0 .6em; padding-left: 1.4em; } li { margin:.15em 0; }
a { color: var(--cyan); text-decoration: none; }
.deadlink { color: var(--dim); }
code { font: 8.6pt Consolas, "Cascadia Mono", "Courier New", monospace; background: var(--soft); padding: 0 2px; border-radius: 2px; overflow-wrap:anywhere; }
pre.code { margin: .6em 0 .9em; padding: 6px 8px; background: #fafafa; border: .6pt solid var(--line); border-left: 2.5pt solid var(--cyan); border-radius: 2px; counter-reset: ln; font: 8pt/1.28 Consolas, "Cascadia Mono", "Courier New", monospace; white-space: pre-wrap; word-break: break-all; overflow: hidden; }
pre.code code { font: inherit; background:none; padding:0; display:block; }
.l { display:block; white-space: pre-wrap; word-break: break-all; break-inside: avoid; }
pre.num .l { padding-left: 3.4em; text-indent: -3.4em; counter-increment: ln; }
pre.num .l::before { content: counter(ln); display:inline-block; width: 2.7em; margin-right: .7em; text-indent:0; text-align:right; color:#9ca3af; }
.hljs-keyword,.hljs-selector-tag,.hljs-built_in,.hljs-literal,.hljs-type { color:#6d28d9; }
.hljs-string,.hljs-regexp,.hljs-attr,.hljs-template-variable { color:#0f766e; }
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-meta { color:#b45309; }
.hljs-comment,.hljs-quote { color:#6b7280; font-style: italic; }
.hljs-title,.hljs-section,.hljs-name,.hljs-selector-class,.hljs-selector-id { color:#0e7490; }
.hljs-variable,.hljs-params,.hljs-property { color:#1f2937; } .hljs-tag { color:#475569; } .hljs-addition { color:#166534; } .hljs-deletion { color:#991b1b; }
table { border-collapse: collapse; width:100%; margin:.6em 0 1em; font-size: 8.6pt; table-layout: auto; }
th,td { border: .6pt solid var(--line); padding: 2.5px 5px; vertical-align: top; text-align:left; }
th { background: #ecfeff; color:#164e63; } tr { break-inside: avoid; } thead { display: table-header-group; }
td code,th code { font-size: 7.8pt; word-break: break-all; }
blockquote { margin:.6em 0; padding: .2em .9em; border-left: 3pt solid var(--violet); background:#faf5ff; color:var(--dim); }
img { max-width: 100%; } img.diagram { display:block; margin:0 auto; max-width:100%; max-height: 210mm; width:auto; height:auto; }
img.shot { max-width: 100%; max-height: 120mm; display:block; margin: 0 auto; border: .6pt solid var(--line); }
figure.fig { margin: .8em 0; text-align:center; break-inside: avoid; } figcaption { font-size: 8pt; color: var(--dim); }
hr { border:0; border-top:.6pt solid var(--line); margin:1em 0; }
/* title page */
.title { min-height: 245mm; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; }
.title svg { width: 62mm; height: auto; margin-bottom: 10mm; }
.title .big { font-size: 34pt; font-weight: 800; margin: 0; color: var(--ink); letter-spacing: -.5pt; }
.title .big span { background: linear-gradient(100deg, #0891b2, #7c3aed); -webkit-background-clip:text; background-clip:text; color: transparent; }
.title .sub { margin-top: 5mm; font-size: 13pt; color: var(--dim); max-width: 130mm; }
.title .meta { margin-top: 22mm; font-size: 9pt; color: var(--dim); line-height: 1.6; }
.title .rule { width: 60mm; height: 3px; background: linear-gradient(90deg, #0891b2, #7c3aed); margin: 8mm 0 0; }
/* toc */
.toc h2 { margin-top:0; } .toc ul { list-style:none; padding:0; margin:0; }
.toc li { margin: 0; } .toc a { display:flex; align-items:baseline; gap:6px; color: var(--ink); padding: 1.6px 0; }
.toc a .t { flex: 0 1 auto; } .toc a .d { flex: 1 1 auto; border-bottom: 1px dotted #9ca3af; transform: translateY(-3px); min-width: 10px; } .toc a .p { flex:none; color: var(--cyan); font-variant-numeric: tabular-nums; }
.toc li.part { margin-top: 9px; font-weight:700; } .toc li.part a { color: var(--violet); font-size: 11pt; }
.toc li.front a, .toc li.ch a { padding-left: 10px; font-size: 9.5pt; }
`;
const HTML_HEAD = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Building Ghost AI from Scratch</title><style>${CSS}</style></head><body>${body}</body></html>`;

// ---------------------------------------------------------------- PDF
const countPdfPages = (buf) => (buf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
async function makePdf(pieces, titleHtml, tocBuilder) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const printHtml = async (inner) => {
    await page.setContent(HTML_HEAD(inner), { waitUntil: "load" });
    return await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, outline: false, tagged: false, timeout: 0 });
  };
  const wrap = (p) => `<section class="piece">${p.html}</section>`;
  try {
    const counts = [];
    const placeholder = pieces.map((p) => ({ ...p }));
    // pass 1: measure every piece with placeholder TOC
    const tocPieceIdx = placeholder.findIndex((p) => p.kind === "toc");
    placeholder[tocPieceIdx].html = tocBuilder(new Map());
    for (let i = 0; i < placeholder.length; i++) {
      const buf = await printHtml(wrap(placeholder[i]));
      counts.push(countPdfPages(buf));
      if (i % 10 === 0) log(`measured piece ${i + 1}/${placeholder.length}`);
    }
    const starts = new Map();
    let pg = 1;
    placeholder.forEach((p, i) => { if (p.id) starts.set(p.id, pg); pg += counts[i]; });
    const finalPieces = pieces.map((p) => ({ ...p }));
    finalPieces[tocPieceIdx].html = tocBuilder(starts);
    log("printing final PDF");
    const inner = finalPieces.map(wrap).join("\n");
    await page.setContent(HTML_HEAD(inner), { waitUntil: "load" });
    const buf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, outline: true, tagged: false, timeout: 0 });
    return { buf, expected: pg - 1, starts, counts };
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------- main
async function main() {
  log(`repo ${HEAD.short}${dirty ? "+local changes" : ""}; ${listed.length} listed files; ${commits.length} commits`);
  prepareMermaid();
  setupMarked();
  const chk = captureChecks();
  buildChapters(chk);
  assignIds();
  if (missingNotes.length) log(`WARNING ${missingNotes.length} files without a note:\n  ${missingNotes.join("\n  ")}`);

  // part lists
  const partListFor = (idx) => {
    const items = [];
    for (let i = idx + 1; i < chapters.length && chapters[i].level !== 1; i++) items.push(`- [${chapters[i].title}](#${chapters[i].id})`);
    return items.join("\n");
  };
  chapters.forEach((c, i) => { if (c.level === 1) c.partList = partListFor(i); });

  // ---- markdown
  const subtitle = "An annotated, reproducible mirror of the Ghost AI repository: the story, the architecture, every source file, the layout and the execution log.";
  const frontMd = `# Building Ghost AI from Scratch\n\n${subtitle}\n\n- Generated from commit \`${HEAD.short}\` (${HEAD.date.slice(0, 10)}, "${HEAD.subject}")${dirty ? " plus uncommitted working-tree changes" : ""}\n- Generator: \`node scripts/build-book.mjs\` (\`npm run docs:book\`)\n- Repository: Ghost AI, package \`${packageJson.name}\` ${packageJson.version}\n\n## Table of contents\n\n${chapters.map((c) => (c.level === 1 ? `\n**${c.title}**\n` : `- [${c.title}](#${c.id})`)).join("\n")}\n`;
  const bodyMd = chapters.map((c) => c.md.replace(/\{\{partlist\}\}/g, c.partList ?? "")).join("\n\n");
  const fullMd = `${frontMd}\n${bodyMd}\n`;
  fs.writeFileSync(`${BOOK}/Ghost-AI-Book.md`, fullMd);
  const words = fullMd.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  const codeLines = [...fullMd.matchAll(/```[\s\S]*?```/g)].reduce((s, m) => s + m[0].split("\n").length - 2, 0);
  log(`markdown written: ${fullMd.split("\n").length} lines, ${words} prose words, ${codeLines} code lines, ${fmtKB(Buffer.byteLength(fullMd))}`);

  if (args.has("--no-pdf")) return;

  // ---- html pieces
  const logoSvg = rd("public/brand/ghost-ai-logo.svg").replace(/<\?xml[^>]*\?>/, "");
  const titleHtml = `<div class="title">${logoSvg}<h1 class="big" style="border:0;margin:0;padding:0;font-size:34pt;color:inherit">Building <span>Ghost AI</span><br>from Scratch</h1><div class="rule"></div><p class="sub">${esc(subtitle)}</p><div class="meta">Generated from commit <code>${HEAD.short}</code> &middot; ${HEAD.date.slice(0, 10)}${dirty ? " + working tree" : ""}<br>${listed.length} annotated files &middot; ${commits.length} commits &middot; 8 agents<br>Built by <code>node scripts/build-book.mjs</code></div></div>`;
  const tocBuilder = (starts) => {
    const li = chapters.map((c) => `<li class="${c.level === 1 ? "part" : c.front ? "front" : "ch"}"><a href="#${c.id}"><span class="t">${esc(c.title)}</span><span class="d"></span><span class="p">${starts.get(c.id) ?? "000"}</span></a></li>`).join("");
    return `<div class="toc"><h2 id="toc">Contents</h2><ul>${li}</ul></div>`;
  };
  const pieces = [{ kind: "title", html: titleHtml }, { kind: "toc", html: "" }];
  chapters.forEach((c, i) => pieces.push({ kind: c.level === 1 ? "part" : "chapter", id: c.id, html: renderChapter(c, c.partList ? c.partList.split("\n").map((l) => { const m = l.match(/\[(.*)\]\(#(.*)\)/); return m ? `- [${m[1]}](#${m[2]})` : l; }).join("\n") : "") }));
  log(`rendered ${pieces.length} pieces to HTML`);

  let res;
  try { res = await makePdf(pieces, titleHtml, tocBuilder); }
  catch (e) { log(`PDF generation failed: ${e.message}`); process.exitCode = 1; return; }
  fs.writeFileSync(`${BOOK}/Ghost-AI-Book.pdf`, res.buf);
  const pages = countPdfPages(res.buf);
  const info = { generatedFromCommit: HEAD.short, commitDate: HEAD.date, workingTreeDirty: dirty, pdfPages: pages, expectedPagesFromPieces: res.expected, pdfBytes: res.buf.length, markdownBytes: Buffer.byteLength(fullMd), markdownLines: fullMd.split("\n").length, proseWords: words, codeLines, annotatedFiles: listed.length, chapters: chapters.length, mermaid: mermaidStats, filesWithoutNotes: missingNotes.length, startsWithPdfMagic: res.buf.subarray(0, 5).toString("latin1") === "%PDF-" };
  fs.writeFileSync(`${BOOK}/build-info.json`, JSON.stringify(info, null, 2) + "\n");
  log(`PDF written: ${pages} pages (expected ${res.expected}), ${(res.buf.length / 1048576).toFixed(1)} MB`);
  console.log(JSON.stringify(info, null, 2));
}
await main();
