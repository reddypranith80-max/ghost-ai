// Extract ```mermaid blocks from README.md + docs/**/*.md, parse each with
// mermaid.parse (jsdom shim), and (unless --no-render) render SVG to docs/diagrams/.
// Usage: node scripts/check-mermaid.mjs [--no-render]
// Rendering uses @mermaid-js/mermaid-cli with a system Edge/Chrome (PUPPETEER_EXECUTABLE_PATH
// or auto-detected); if none is found, rendering is skipped with a warning.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, relative, basename, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { JSDOM } from "jsdom";

const root = process.cwd();
const outDir = join(root, "docs", "diagrams");
const noRender = process.argv.includes("--no-render");

const dom = new JSDOM("<!doctype html><body></body>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const mermaid = (await import("mermaid")).default;
mermaid.initialize({ startOnLoad: false });

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (n.endsWith(".md")) acc.push(p);
  }
  return acc;
}
const files = [join(root, "README.md"), ...walk(join(root, "docs"))].filter(existsSync);

const blocks = [];
for (const f of files) {
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  const re = /```mermaid\n([\s\S]*?)\n```/g;
  let m, i = 0;
  while ((m = re.exec(src))) {
    i++;
    const line = src.slice(0, m.index).split("\n").length;
    blocks.push({ file: relative(root, f).split(sep).join("/"), idx: i, line, code: m[1] });
  }
}

let parsed = 0;
const failed = [];
for (const b of blocks) {
  try {
    await mermaid.parse(b.code);
    parsed++;
  } catch (e) {
    failed.push(b);
    console.error(`PARSE FAIL ${b.file}:${b.line} #${b.idx}: ${String(e.message ?? e).split("\n").slice(0, 4).join(" | ")}`);
  }
}
console.log(`Found ${blocks.length} diagram(s); parsed OK: ${parsed}; failed: ${failed.length}`);

let rendered = 0;
if (!noRender && failed.length === 0 && blocks.length) {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const exe = candidates.find((p) => existsSync(p));
  if (!exe) {
    console.warn("No Chrome/Edge found; skipping render (set PUPPETEER_EXECUTABLE_PATH).");
  } else {
    mkdirSync(outDir, { recursive: true });
    const cfg = join(tmpdir(), "mmdc-puppeteer.json");
    writeFileSync(cfg, JSON.stringify({ executablePath: exe, args: ["--no-sandbox", "--disable-setuid-sandbox"] }));
    const mmdc = join(root, "node_modules", "@mermaid-js", "mermaid-cli", "src", "cli.js");
    for (const b of blocks) {
      const name = `${basename(b.file, ".md").toLowerCase()}-${b.idx}`;
      const inp = join(tmpdir(), `${name}.mmd`);
      writeFileSync(inp, b.code);
      const r = spawnSync(process.execPath, [mmdc, "-i", inp, "-o", join(outDir, `${name}.svg`), "-p", cfg, "-b", "transparent", "-q"], { encoding: "utf8" });
      if (r.status === 0) rendered++;
      else console.error(`RENDER FAIL ${name}: ${(r.stderr || r.stdout).split("\n").slice(0, 3).join(" | ")}`);
    }
    console.log(`Rendered ${rendered}/${blocks.length} to docs/diagrams/`);
  }
}
process.exit(failed.length ? 1 : 0);
