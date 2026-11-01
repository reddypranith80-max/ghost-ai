#!/usr/bin/env node
// Link checker for Ghost AI. Node built-ins + global fetch only.
//
//   node scripts/check-links.mjs                       check README.md and docs/**/*.md (not docs/book)
//   node scripts/check-links.mjs --site <baseUrl>      also crawl a running site (respects its base path)
//   node scripts/check-links.mjs --no-external         skip external URL checks (relative links + anchors only)
//   node scripts/check-links.mjs --out docs/LINK-REPORT.md
//
// Exit code 1 when any failure is found. Writes a Markdown report (default docs/LINK-REPORT.md).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const SITE = opt("--site", null);
const OUT = resolve(ROOT, opt("--out", "docs/LINK-REPORT.md"));
const SKIP_EXTERNAL = flag("--no-external");

const TIMEOUT_MS = 15_000;
const RETRIES = 2;
const CONCURRENCY = 8;
const UA = "Mozilla/5.0 (compatible; ghost-ai-link-check/1.0; +https://github.com/reddypranith80-max/ghost-ai)";
// Hosts that block bots / require login; they are listed in the report as skipped, never silently ignored.
const ALLOWLIST = ["linkedin.com", "www.linkedin.com", "twitter.com", "x.com", "medium.com", "localhost", "127.0.0.1"];

// ---------- helpers ----------
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    }),
  );
  return out;
}

function walk(dir, skipDirs = []) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return skipDirs.includes(p) ? [] : walk(p, skipDirs);
    return [p];
  });
}

/** GitHub-style heading slug. */
function slugify(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "")
    .replace(/\s/g, "-");
}

const anchorCache = new Map();
function anchorsOf(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const set = new Set();
  const seen = new Map();
  let inFence = false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const base = slugify(m[1]);
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      set.add(n === 0 ? base : `${base}-${n}`);
    }
    for (const a of line.matchAll(/<a\s[^>]*(?:id|name)=["']([^"']+)["']/gi)) set.add(a[1]);
  }
  anchorCache.set(file, set);
  return set;
}

/** Extract link targets from Markdown, ignoring fenced code and inline code. */
function extractLinks(src) {
  const links = [];
  const lines = src.split(/\r?\n/);
  let inFence = false;
  lines.forEach((raw, idx) => {
    if (/^\s*(```|~~~)/.test(raw)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const line = raw.replace(/`[^`]*`/g, "");
    const add = (url) => links.push({ url: url.trim(), line: idx + 1 });
    for (const m of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) add(m[1]);
    for (const m of line.matchAll(/<(?:a|img|video|source|link|script)\s[^>]*?(?:href|src|poster)=["']([^"']+)["']/gi)) add(m[1]);
    for (const m of line.matchAll(/<(https?:\/\/[^>\s]+)>/g)) add(m[1]);
    for (const m of line.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/g)) add(m[1]);
  });
  return links;
}

async function fetchStatus(url) {
  let last = { status: 0, error: "unknown" };
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA, accept: "*/*" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (method === "GET") res.body?.cancel().catch(() => {});
        if (res.status < 400) return { status: res.status };
        last = { status: res.status };
        if (method === "HEAD") continue; // some servers reject HEAD: retry with GET
        if (res.status === 404 || res.status === 410) return last; // definitive
      } catch (e) {
        last = { status: 0, error: e?.name === "TimeoutError" ? "timeout" : (e?.cause?.code ?? e?.message ?? "error") };
      }
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  return last;
}

// ---------- (a) docs ----------
const docFiles = [join(ROOT, "README.md"), ...walk(join(ROOT, "docs"), [join(ROOT, "docs", "book")]).filter((f) => f.endsWith(".md"))].filter(existsSync);
const rel = (p) => relative(ROOT, p).split(sep).join("/");

const docResult = { files: docFiles.length, links: 0, relOk: 0, relFail: [], anchorOk: 0, anchorFail: [], extUnique: 0, extOk: 0, extFail: [], extSkipped: [] };
const externals = new Map(); // url -> [{file,line}]

for (const file of docFiles) {
  for (const { url, line } of extractLinks(readFileSync(file, "utf8"))) {
    if (!url || /^(mailto:|tel:|javascript:|data:)/i.test(url)) continue;
    if (/[<>{}]/.test(url)) continue; // template placeholder such as <user> or {id}
    docResult.links++;
    const where = `${rel(file)}:${line}`;
    if (/^https?:\/\//i.test(url)) {
      const key = url.replace(/#.*$/, "");
      if (!externals.has(key)) externals.set(key, []);
      externals.get(key).push(where);
      continue;
    }
    // relative or root-relative (repo root) or anchor-only
    const [pathPart, rawAnchor] = url.split("#");
    const anchor = rawAnchor ? decodeURIComponent(rawAnchor) : "";
    const cleanPath = decodeURIComponent((pathPart || "").split("?")[0]);
    const target = cleanPath === "" ? file : cleanPath.startsWith("/") ? join(ROOT, cleanPath) : resolve(dirname(file), cleanPath);
    if (!existsSync(target)) {
      docResult.relFail.push({ where, url, reason: "file not found" });
      continue;
    }
    docResult.relOk++;
    if (anchor && target.endsWith(".md") && statSync(target).isFile()) {
      if (anchorsOf(target).has(anchor.toLowerCase()) || anchorsOf(target).has(anchor)) docResult.anchorOk++;
      else docResult.anchorFail.push({ where, url, reason: `no heading "#${anchor}" in ${rel(target)}` });
    }
  }
}

if (!SKIP_EXTERNAL) {
  docResult.extUnique = externals.size;
  const entries = [...externals.entries()];
  await pool(entries, CONCURRENCY, async ([url, wheres]) => {
    const host = new URL(url).hostname;
    if (ALLOWLIST.includes(host)) {
      docResult.extSkipped.push({ url, host, wheres });
      return;
    }
    const r = await fetchStatus(url);
    if (r.status >= 200 && r.status < 400) docResult.extOk++;
    else docResult.extFail.push({ url, wheres, status: r.status, error: r.error });
  });
}

// ---------- (b) site crawl ----------
const siteResult = SITE
  ? { base: SITE, pages: 0, fail: [], noTitle: [], assetFail: [], anchorFail: [], outside: [], assetsChecked: 0 }
  : null;

if (SITE) {
  const base = new URL(SITE.endsWith("/") ? SITE : SITE + "/");
  const basePath = base.pathname.replace(/\/$/, ""); // "" or "/ghost-ai"
  const startUrl = base.href;
  const queue = [startUrl];
  const seen = new Set([startUrl]);
  const pageIds = new Map(); // url(no hash) -> Set(ids)
  const anchorRefs = []; // {from, target, id}
  const assetSet = new Map(); // url -> from
  const norm = (u) => {
    const x = new URL(u);
    x.hash = "";
    return x.href;
  };
  const isExt = (p) => /\.[a-z0-9]{2,5}$/i.test(p) && !/\.html?$/i.test(p);

  const attrs = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
  while (queue.length && siteResult.pages < 600) {
    const batch = queue.splice(0, CONCURRENCY);
    await pool(batch, CONCURRENCY, async (url) => {
      let res, html = "";
      try {
        res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
        const type = res.headers.get("content-type") || "";
        if (type.includes("text/html")) html = await res.text();
        else res.body?.cancel().catch(() => {});
      } catch (e) {
        siteResult.fail.push({ url, status: 0, error: e?.name === "TimeoutError" ? "timeout" : (e?.cause?.code ?? e?.message) });
        return;
      }
      siteResult.pages++;
      if (res.status !== 200) {
        siteResult.fail.push({ url, status: res.status });
        return;
      }
      if (!html) return;
      if (!/<title[^>]*>\s*[^<\s][^<]*<\/title>/i.test(html)) siteResult.noTitle.push(url);
      pageIds.set(norm(res.url), new Set([...attrs(html, /\sid=["']([^"']+)["']/gi), ...attrs(html, /<a[^>]*\sname=["']([^"']+)["']/gi)]));

      const resolveRef = (ref) => {
        if (!ref || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(ref)) return null;
        try {
          return new URL(ref.replace(/&amp;/g, "&"), res.url);
        } catch {
          return null;
        }
      };
      const hrefs = [...html.matchAll(/<a\s[^>]*?href=["']([^"']*)["']/gi)].map((m) => m[1]);
      for (const h of hrefs) {
        const u = resolveRef(h);
        if (!u || u.origin !== base.origin) continue;
        if (basePath && !(u.pathname === basePath || u.pathname.startsWith(basePath + "/"))) {
          siteResult.outside.push({ from: url, ref: h });
          continue;
        }
        if (u.hash.length > 1) anchorRefs.push({ from: url, target: norm(u.href), id: decodeURIComponent(u.hash.slice(1)) });
        const n = norm(u.href);
        if (isExt(u.pathname) || u.pathname.includes("/api/")) {
          if (!assetSet.has(n)) assetSet.set(n, url);
        } else if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
      const srcs = [
        ...attrs(html, /<(?:img|script|source|video|audio|iframe)\s[^>]*?src=["']([^"']+)["']/gi),
        ...attrs(html, /<link\s[^>]*?href=["']([^"']+)["']/gi),
        ...attrs(html, /<video\s[^>]*?poster=["']([^"']+)["']/gi),
      ];
      for (const s of srcs) {
        const u = resolveRef(s);
        if (!u || u.origin !== base.origin) continue;
        const n = norm(u.href);
        if (!assetSet.has(n)) assetSet.set(n, url);
      }
    });
  }

  // assets: same-site only, HEAD (GET fallback)
  const assets = [...assetSet.entries()];
  siteResult.assetsChecked = assets.length;
  await pool(assets, CONCURRENCY, async ([u, from]) => {
    const r = await fetchStatus(u);
    if (!(r.status >= 200 && r.status < 400)) siteResult.assetFail.push({ url: u, from, status: r.status, error: r.error });
  });

  for (const a of anchorRefs) {
    const ids = pageIds.get(a.target);
    if (ids && !ids.has(a.id) && !["top", "main"].includes(a.id)) siteResult.anchorFail.push(a);
  }
}

// ---------- report ----------
const failCount =
  docResult.relFail.length + docResult.anchorFail.length + docResult.extFail.length +
  (siteResult ? siteResult.fail.length + siteResult.noTitle.length + siteResult.assetFail.length + siteResult.anchorFail.length + siteResult.outside.length : 0);

const L = [];
L.push("# Link report", "");
L.push(`Generated by \`npm run check:links\` (\`scripts/check-links.mjs\`) on ${new Date().toISOString()}.`, "");
L.push(`**Result: ${failCount === 0 ? "PASS, no broken links" : `${failCount} problem(s) found`}.**`, "");
L.push("## (a) Markdown files: README.md and docs/**/*.md (docs/book excluded)", "");
L.push("| Check | OK | Failed |", "|---|---|---|");
L.push(`| Files scanned | ${docResult.files} | |`);
L.push(`| Relative links (file exists) | ${docResult.relOk} | ${docResult.relFail.length} |`);
L.push(`| Anchors into .md files | ${docResult.anchorOk} | ${docResult.anchorFail.length} |`);
L.push(SKIP_EXTERNAL ? "| External URLs | skipped (--no-external) | |" : `| External URLs (${docResult.extUnique} unique) | ${docResult.extOk} | ${docResult.extFail.length} |`);
L.push(`| Allowlisted hosts (not checked) | ${docResult.extSkipped.length} | |`, "");
L.push("Method: relative paths are checked on disk and heading anchors with GitHub-style slugs. External URLs use HEAD then GET, 15 s timeout, 2 retries, concurrency 8; 2xx and 3xx count as OK. Links inside code fences and inline code, and template placeholders like `<user>`, are ignored.", "");
const section = (title, rows, fmt) => {
  if (!rows.length) return;
  L.push(`### ${title}`, "", ...rows.map(fmt), "");
};
section("Broken relative links", docResult.relFail, (r) => `- \`${r.where}\`: \`${r.url}\` (${r.reason})`);
section("Broken anchors", docResult.anchorFail, (r) => `- \`${r.where}\`: \`${r.url}\` (${r.reason})`);
section("Failed external URLs (4xx/5xx/timeout)", docResult.extFail, (r) => `- ${r.url} -> ${r.status || r.error} (in ${r.wheres.slice(0, 3).map((w) => `\`${w}\``).join(", ")})`);
section("Allowlisted (bot-blocking or local) hosts, not checked", docResult.extSkipped, (r) => `- ${r.url} (${r.host})`);

if (siteResult) {
  L.push(`## (b) Site crawl: ${siteResult.base}`, "");
  L.push("| Check | Count |", "|---|---|");
  L.push(`| Pages fetched | ${siteResult.pages} |`);
  L.push(`| Non-200 pages | ${siteResult.fail.length} |`);
  L.push(`| Pages without a <title> | ${siteResult.noTitle.length} |`);
  L.push(`| Same-site assets/links checked (img, script, css, files) | ${siteResult.assetsChecked} |`);
  L.push(`| Broken same-site assets | ${siteResult.assetFail.length} |`);
  L.push(`| Broken internal anchors | ${siteResult.anchorFail.length} |`);
  L.push(`| Links escaping the base path | ${siteResult.outside.length} |`, "");
  section("Non-200 pages", siteResult.fail, (r) => `- ${r.url} -> ${r.status || r.error}`);
  section("Missing <title>", siteResult.noTitle, (u) => `- ${u}`);
  section("Broken assets", siteResult.assetFail, (r) => `- ${r.url} -> ${r.status || r.error} (referenced from ${r.from})`);
  section("Broken internal anchors", siteResult.anchorFail, (r) => `- ${r.from} -> ${r.target}#${r.id}`);
  section("Links outside the base path", siteResult.outside.slice(0, 50), (r) => `- ${r.from} -> \`${r.ref}\``);
} else {
  L.push("## (b) Site crawl", "", "Not run. Use `node scripts/check-links.mjs --site <baseUrl>` (for example `http://localhost:3000` or `https://reddypranith80-max.github.io/ghost-ai`).", "");
}
writeFileSync(OUT, L.join("\n") + "\n");

console.log(`Docs: ${docResult.files} files, ${docResult.links} links | relative ok ${docResult.relOk} fail ${docResult.relFail.length} | anchors ok ${docResult.anchorOk} fail ${docResult.anchorFail.length} | external ok ${docResult.extOk}/${docResult.extUnique} fail ${docResult.extFail.length} skipped ${docResult.extSkipped.length}`);
if (siteResult) console.log(`Site ${siteResult.base}: pages ${siteResult.pages}, non-200 ${siteResult.fail.length}, no-title ${siteResult.noTitle.length}, assets checked ${siteResult.assetsChecked}, asset fail ${siteResult.assetFail.length}, anchor fail ${siteResult.anchorFail.length}, outside-base ${siteResult.outside.length}`);
console.log(`Report: ${rel(OUT)} (${failCount === 0 ? "PASS" : failCount + " problem(s)"})`);
process.exit(failCount === 0 ? 0 : 1);
