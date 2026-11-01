// Records the product demo video: node scripts/record-demo.mjs   (npm run demo:record)
// Needs a production build (npm run build). Starts `next start` on :3501 in demo mode (no Clerk keys),
// (viewport 1280x720, video scaled to 960x540 to stay under 15 MB) drives the real UI with Playwright (system Edge), overlays captions, and writes
//   public/demo/ghost-ai-demo.webm  +  public/demo/poster.png
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const PORT = 3501;
const ORIGIN = `http://localhost:${PORT}`;
const root = process.cwd();
const outDir = join(root, "public", "demo");
const tmp = join(root, "test-results", "demo-video");
mkdirSync(outDir, { recursive: true });
rmSync(tmp, { recursive: true, force: true });

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: root, shell: true, stdio: "ignore",
  env: { ...process.env, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "", CLERK_SECRET_KEY: "" },
});
const stopServer = () => {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
};
async function waitUp() {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(`${ORIGIN}/api/health`)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

const CAPTION_JS = (text) => {
  let el = document.getElementById("__demo_caption");
  if (!el) {
    el = document.createElement("div");
    el.id = "__demo_caption";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;max-width:min(1000px,92vw);padding:12px 22px;border-radius:10px;background:rgba(5,6,13,.92);border:1px solid #22e5ff;box-shadow:0 0 30px -6px #22e5ff;color:#fff;font:600 20px/1.35 system-ui,sans-serif;text-align:center;pointer-events:none;transition:opacity .25s";
    document.body.appendChild(el);
  }
  el.textContent = text;
};

const browser = await chromium.launch({ channel: "msedge" });
let video;
try {
  await waitUp();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: tmp, size: { width: 960, height: 540 } } });
  const page = await ctx.newPage();
  video = page.video();
  const wait = (ms) => page.waitForTimeout(ms);
  const say = async (t) => { await page.evaluate(CAPTION_JS, t); };
  const go = async (path, t) => { await page.goto(ORIGIN + path, { waitUntil: "networkidle" }); await say(t); };
  const scroll = async (px, steps = 12, gap = 70) => {
    for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, px / steps); await wait(gap); }
  };
  const nav = (label) => page.getByRole("navigation", { name: "Dashboard" }).getByRole("link", { name: label });
  const runStep = async () => {
    const b = page.getByRole("main").getByRole("button", { name: /Run next step|Executing/ });
    await b.click();
    await page.getByRole("main").getByRole("button", { name: /Run next step/ }).waitFor({ timeout: 20000 });
  };

  // 1. Landing
  await go("/", "Ghost AI: describe a SaaS, and a crew of 8 AI agents builds it.");
  await wait(3500);
  await say("Scroll through the pipeline, the live terminal and the I/O demo...");
  await scroll(1500, 20); await wait(1200);
  await scroll(1500, 20); await wait(1200);
  const crew = page.locator("button[aria-expanded]").filter({ has: page.getByRole("heading", { name: "Backend" }) });
  await crew.scrollIntoViewIfNeeded();
  await say("Every lead agent has side agents. Click a card to meet them.");
  await wait(800); await crew.click(); await wait(2800);

  // 2. How it works
  await go("/how-it-works", "How it works: brief, plan, parallel build, verify, review, ship.");
  await wait(2000); await scroll(1400, 20); await wait(1500);

  // 3. Agents directory
  await go("/agents", "The crew: 8 lead agents and 24 side agents, each with tools and outputs.");
  await wait(1500);
  await page.getByLabel("Search agents").pressSequentially("secur", { delay: 140 });
  await wait(1200);
  await page.getByRole("button", { name: /sub-agents/ }).first().click();
  await say("Search and expand any agent to see its sub-agents.");
  await wait(2800);

  // 4. Dashboard: new project wizard
  await go("/dashboard", "The dashboard: mission control for your project. Let's start a new one.");
  await nav("Overview").waitFor();
  await wait(2000);
  await page.locator("aside").first().getByRole("button", { name: /New project/ }).click();
  const dlg = page.getByRole("dialog");
  await say("Step 1: pick a template or write your own brief.");
  await wait(900);
  await dlg.getByRole("button", { name: "Invoice Hub" }).click();
  await wait(1800);
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await say("Step 2: choose the stack. Suggestions come from the stack catalog API.");
  await wait(2200);
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await say("Step 3: review the plan the 8 agents will follow.");
  await wait(2500);
  await dlg.getByRole("button", { name: /Launch agents/ }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });

  // 5. Run the pipeline
  await say("Run next step: the Architect plans, then agents build in order.");
  await wait(1500);
  for (let i = 1; i <= 4; i++) {
    await runStep();
    await say(`Pipeline step ${i}: tasks advance, agents commit, the log updates.`);
    await wait(1700);
  }
  await page.screenshot({ path: join(outDir, "poster.png") });
  await scroll(500, 8); await wait(1500);
  await page.evaluate(() => window.scrollTo(0, 0));

  // 6. Agents + sub-agents
  await nav("Agents").click();
  await say("Agents view: live status, current task, tools and outputs.");
  await wait(1800);
  await page.getByRole("button", { name: /Side agents \(\d+\)/ }).first().click();
  await say("Expand a lead agent to watch its side agents work.");
  await wait(2500);
  await page.getByRole("button", { name: /View logs/ }).first().click();
  await say("Per-agent logs stream in a drawer.");
  await wait(2500);
  await page.getByRole("button", { name: "Close logs" }).click();

  // 7. Tasks board
  await nav("Tasks").click();
  await say("Task board: move cards with the arrows or drag and drop.");
  await wait(1800);
  const col = (label) => page.locator("main div.gh-glass").filter({ has: page.getByText(label, { exact: true }) }).filter({ has: page.locator("ul") }).last();
  const todo = col("To do");
  await todo.locator("article").first().getByRole("button", { name: "Move right" }).click();
  await wait(1500);
  await todo.locator("article").first().dragTo(col("Running"));
  await say("Dragged a task into Running.");
  await wait(2200);

  // 8. Git log
  await nav("Git Log").click();
  await say("Git log: every merged task is a commit authored by an agent.");
  await wait(2000);
  await page.locator("main li code").first().click();
  await say("Open a commit to see the files it changed. Copy the hash in one click.");
  await wait(1500);
  await page.getByRole("dialog").getByRole("button", { name: /Copy hash/ }).click();
  await wait(2200);
  await page.keyboard.press("Escape");

  // 9. Flow
  await nav("Flow").click();
  await say("Flow: the agent pipeline as a live graph. Click any node.");
  await wait(1800);
  await page.locator("svg [role=button]").filter({ hasText: /Frontend|PRISM/i }).first().click();
  await wait(2500);

  // 10. Command palette
  await page.keyboard.press("Control+k");
  await say("Ctrl+K opens the command palette: navigate, run steps, switch projects.");
  await page.keyboard.type("export", { delay: 120 });
  await wait(1800);
  await page.keyboard.press("Enter");

  // 11. Exports
  await say("Exports: preview the generated file tree, then ship it.");
  await page.getByText(/File tree/i).first().waitFor();
  await wait(2500);
  await page.getByRole("button", { name: /README\.md/ }).first().click();
  await wait(1800);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download \.zip/ }).click()]);
  await say(`Downloaded ${dl.suggestedFilename()}. 'Save to folder' writes real files in Chrome or Edge.`);
  await wait(3500);
  await say("Ghost AI: from brief to shipped project. Try it yourself.");
  await wait(2500);

  await ctx.close();
  await video.saveAs(join(outDir, "ghost-ai-demo.webm"));
} finally {
  await browser.close();
  stopServer();
}
const mb = statSync(join(outDir, "ghost-ai-demo.webm")).size / 1048576;
console.log(`wrote public/demo/ghost-ai-demo.webm (${mb.toFixed(2)} MB) and poster.png`);
if (mb > 15) { console.error("video exceeds 15 MB"); process.exit(1); }
