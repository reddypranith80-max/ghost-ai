// Smoke test for the static GitHub Pages export. Run after:
//   $env:NEXT_PUBLIC_BASE_PATH='/ghost-ai'; node scripts/pages-build.mjs
// Serves out/ under /ghost-ai/ and checks pages load without console errors, assets use the base path,
// and the dashboard runs in demo mode.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = "/ghost-ai";
const root = path.resolve("out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".png": "image/png", ".webm": "video/webm" };
const server = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (!p.startsWith(BASE)) { s.writeHead(404); return s.end(); }
  p = p.slice(BASE.length) || "/";
  let f = path.join(root, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { s.writeHead(404); return s.end("nf"); }
  s.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(s);
});
await new Promise((r) => server.listen(3300, r));

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); if (!ok) fails.push(msg); };
const browser = await chromium.launch({ channel: "msedge" });
try {
  for (const route of ["/", "/dashboard/", "/demo/", "/sign-in/", "/agents/", "/how-it-works/", "/docs/quick-start/"]) {
    const page = await browser.newPage();
    const errors = [];
    const reqs = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text() + " @ " + m.location().url));
    page.on("request", (r) => reqs.push(r.url()));
    const res = await page.goto(`http://localhost:3300${BASE}${route}`, { waitUntil: "networkidle" });
    check(res?.status() === 200, `${route} -> 200`);
    check(errors.length === 0, `${route} no console errors ${errors.join(" | ")}`);
    const local = reqs.filter((u) => u.startsWith("http://localhost:3300"));
    const bad = local.filter((u) => !new URL(u).pathname.startsWith(BASE + "/"));
    check(bad.length === 0, `${route} all ${local.length} local requests under ${BASE}/ ${bad.join(" ")}`);
    check(local.some((u) => u.includes("/_next/static/")), `${route} loads /_next/static assets`);
    if (route === "/dashboard/") {
      await page.getByRole("navigation", { name: "Dashboard" }).waitFor();
      check(await page.getByText("Demo data").first().isVisible(), "dashboard shows 'Demo data' (local simulation)");
      const b = page.getByRole("main").getByRole("button", { name: /Run next step/ });
      await b.click();
      await page.getByRole("main").getByRole("button", { name: /Run next step/ }).waitFor();
      await page.waitForTimeout(1500);
      check(true, "dashboard Run next step executes in demo mode");
      await page.getByRole("navigation", { name: "Dashboard" }).getByRole("link", { name: "Exports" }).click();
      await page.waitForURL(/dashboard\/exports\/?$/);
      check(await page.getByText(/File tree/i).first().isVisible(), "exports view renders on static export");
    }
    if (route === "/demo/") {
      const hasVideo = await page.locator("video").count();
      console.log(`INFO /demo/ video element present: ${hasVideo > 0}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(fails.length ? `\n${fails.length} FAILED` : "\nALL STATIC CHECKS PASSED");
process.exit(fails.length ? 1 : 0);
