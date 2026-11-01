import { test, expect } from "./fixtures";
import type { APIRequestContext, Page } from "@playwright/test";
import { readZip } from "./zip";

let n = 0;
const uniq = (p: string) => `${p} ${Date.now().toString(36)}${n++}`;

/** Creates an isolated project through the API so tests never fight over shared demo state. */
async function freshProject(request: APIRequestContext, page: Page) {
  const name = uniq("E2E Proj");
  const r = await request.post("/api/projects", { data: { name, brief: "Created by the e2e suite to exercise the dashboard.", stack: ["Next.js", "Postgres", "Clerk"] } });
  expect(r.status()).toBe(201);
  const proj = await r.json();
  await page.goto("/dashboard");
  await page.getByRole("navigation", { name: "Dashboard" }).waitFor();
  await page.locator("aside").first().getByRole("button", { name }).click();
  await expect(page.locator("main h1").first()).toHaveText(name);
  return { name, id: proj.id as string };
}
const nav = (page: Page, label: string) => page.getByRole("navigation", { name: "Dashboard" }).getByRole("link", { name: label }).click();
const kpi = (page: Page, label: string) => page.locator("div.gh-glass").filter({ hasText: label }).first();
const runBtn = (page: Page) => page.getByRole("main").getByRole("button", { name: /Run next step|Executing/ });

test("overview: Run next step advances progress and adds a commit", async ({ page, request }) => {
  await freshProject(request, page);
  const done = kpi(page, "Tasks done"), commits = kpi(page, "Commits");
  const before = await done.innerText();
  for (let i = 0; i < 2; i++) {
    await runBtn(page).click();
    await expect(runBtn(page)).toHaveText(/Run next step/, { timeout: 20_000 });
  }
  await expect.poll(async () => (await commits.innerText()).replace(/\s+/g, " "), { timeout: 10_000 }).not.toMatch(/Commits\s*0\b/);
  expect(await done.innerText()).not.toBe(before);
});

test("command palette: Ctrl+K opens, filters, Enter navigates", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("navigation", { name: "Dashboard" }).waitFor();
  await page.keyboard.press("Control+k");
  const dlg = page.getByRole("dialog");
  await expect(dlg.getByPlaceholder(/Type a command/)).toBeVisible();
  const all = await dlg.locator("li button").count();
  await dlg.getByPlaceholder(/Type a command/).fill("git");
  const some = await dlg.locator("li button").count();
  expect(some).toBeGreaterThan(0);
  expect(some).toBeLessThan(all);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard\/git$/);
  await page.keyboard.press("Control+k");
  await page.getByRole("dialog").getByPlaceholder(/Type a command/).fill("qqqqnothing");
  await expect(page.getByText(/No matches for/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("new project wizard: 3 steps create a project that appears in the sidebar", async ({ page }) => {
  const name = uniq("Wizard Proj");
  await page.goto("/dashboard");
  await page.getByRole("navigation", { name: "Dashboard" }).waitFor();
  await page.locator("aside").first().getByRole("button", { name: /New project/ }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await expect(dlg.getByRole("alert")).toContainText(/brief/i);
  await dlg.getByLabel("Project name").fill(name);
  await dlg.getByLabel("Brief").fill("A wizard-created project for the e2e suite.");
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await expect(dlg.getByRole("alert")).toContainText(/technology/i);
  await dlg.getByRole("button", { name: "Next.js" }).first().click();
  await dlg.getByLabel("Custom technology").fill("Astro");
  await dlg.getByRole("button", { name: "Add", exact: true }).click();
  await dlg.getByRole("button", { name: "Next", exact: true }).click();
  await expect(dlg.getByText("Agent plan preview")).toBeVisible();
  await expect(dlg.getByText(name)).toBeVisible();
  await dlg.getByRole("button", { name: /Launch agents/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("aside").first().getByRole("button", { name })).toBeVisible();
  await expect(page.locator("main h1").first()).toHaveText(name);
});

test("agents view: lead agent expands to side agents, logs drawer opens", async ({ page, request }) => {
  await freshProject(request, page);
  await nav(page, "Agents");
  const toggle = page.getByRole("button", { name: /Side agents \(\d+\)/ }).first();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: /View logs/ }).first().click();
  await expect(page.getByRole("dialog", { name: /logs/ })).toBeVisible();
  await page.getByRole("button", { name: "Close logs" }).click();
  await expect(page.getByRole("dialog", { name: /logs/ })).toHaveCount(0);
});

test("tasks: move a card with the arrow buttons and by drag and drop", async ({ page, request }) => {
  await freshProject(request, page);
  await nav(page, "Tasks");
  const col = (label: string) => page.locator("main div.gh-glass").filter({ has: page.getByText(label, { exact: true }) }).filter({ has: page.locator("ul") }).last();
  const todo = col("To do"), running = col("Running");
  const t0 = await todo.locator("article").count(), r0 = await running.locator("article").count();
  expect(t0).toBeGreaterThan(1);
  await todo.locator("article").first().getByRole("button", { name: "Move right" }).click();
  await expect(todo.locator("article")).toHaveCount(t0 - 1);
  await expect(running.locator("article")).toHaveCount(r0 + 1);
  await todo.locator("article").first().dragTo(running);
  await expect(todo.locator("article")).toHaveCount(t0 - 2);
  await expect(running.locator("article")).toHaveCount(r0 + 2);
});

test("git log: commit dialog opens and copy-hash works", async ({ page, request, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await freshProject(request, page);
  for (let i = 0; i < 3; i++) {
    await runBtn(page).click();
    await expect(runBtn(page)).toHaveText(/Run next step/, { timeout: 20_000 });
  }
  await nav(page, "Git Log");
  const first = page.locator("main li code").first();
  await expect(first).toBeVisible();
  const hash = (await first.innerText()).trim();
  await first.click();
  const dlg = page.getByRole("dialog");
  await expect(dlg.getByText(/Files changed/)).toBeVisible();
  await expect(dlg.locator("code").first()).toHaveText(hash);
  await dlg.getByRole("button", { name: /Copy hash/ }).click();
  await expect(dlg.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(hash);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("flow: clicking a node selects it and shows its panel", async ({ page, request }) => {
  await freshProject(request, page);
  await nav(page, "Flow");
  await page.locator("svg [role=button]").filter({ hasText: /Backend|FORGE/i }).first().click();
  await expect(page.getByRole("heading", { name: /FORGE|Backend/ }).first()).toBeVisible();
});

test("exports: file tree, ZIP download is a valid zip, per-file download", async ({ page, request }, info) => {
  const { name } = await freshProject(request, page);
  await nav(page, "Exports");
  await expect(page.getByText(/File tree \(\d+ files/)).toBeVisible();
  await expect(page.getByRole("button", { name: /README\.md/ }).first()).toBeVisible();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download \.zip/ }).click()]);
  expect(dl.suggestedFilename()).toBe(`${slug}.zip`);
  const p = info.outputPath("export.zip");
  await dl.saveAs(p);
  const z = readZip(p);
  expect(z.head).toBe("PK");
  expect(z.entries.length).toBeGreaterThan(3);
  for (const e of z.entries) {
    expect(e.crcOk, `crc ${e.name}`).toBe(true);
    expect(e.name.startsWith(`${slug}/`), e.name).toBe(true);
  }
  const readme = z.entries.find((e) => e.name.endsWith("/README.md"));
  expect(readme?.data.toString("utf8")).toContain(name);
  const header = page.getByText(/File tree \(\d+ files/);
  const count = async () => Number((await header.innerText()).match(/\((\d+) files/i)![1]);
  const full = await count();
  await page.getByRole("checkbox").first().uncheck();
  expect(await count()).toBeLessThan(full);
  const [one] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /^Download$/ }).click()]);
  expect(one.suggestedFilename().length).toBeGreaterThan(0);
});

test("exports: Save to folder is disabled without the File System Access API", async ({ page, request }) => {
  await page.addInitScript(() => { delete (window as unknown as Record<string, unknown>).showDirectoryPicker; });
  await freshProject(request, page);
  await nav(page, "Exports");
  await expect(page.getByRole("button", { name: /Save to folder/ })).toBeDisabled();
  await expect(page.getByText(/File System Access API/).first()).toBeVisible();
});

test("exports: Save to folder writes real files through a stubbed directory handle", async ({ page, request }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __fs: { written: Record<string, string> }; showDirectoryPicker: () => Promise<unknown> };
    w.__fs = { written: {} };
    const dir = (prefix: string, name: string): unknown => ({
      name,
      getDirectoryHandle: async (n: string) => dir(`${prefix}${n}/`, n),
      getFileHandle: async (n: string) => ({
        createWritable: async () => {
          let buf = "";
          return { write: async (d: string) => { buf += d; }, close: async () => { w.__fs.written[`${prefix}${n}`] = buf; } };
        },
      }),
    });
    w.showDirectoryPicker = async () => dir("", "picked");
  });
  const { name } = await freshProject(request, page);
  await nav(page, "Exports");
  const btn = page.getByRole("button", { name: /Save to folder/ });
  await expect(btn).toBeEnabled();
  await btn.click();
  await expect(page.getByText(/Saved \d+ files to picked\//)).toBeVisible();
  const written = await page.evaluate(() => (window as unknown as { __fs: { written: Record<string, string> } }).__fs.written);
  const keys = Object.keys(written);
  expect(keys.length).toBeGreaterThan(3);
  const readme = keys.find((k) => k.endsWith("README.md"));
  expect(readme).toBeTruthy();
  expect(written[readme!]).toContain(name);
  expect(keys.some((k) => k.split("/").length > 2)).toBe(true);
});

test("settings: accent colour can be changed", async ({ page }) => {
  await page.goto("/dashboard/settings");
  const swatches = page.getByRole("button", { name: /accent$/ });
  expect(await swatches.count()).toBeGreaterThan(1);
  await swatches.nth(1).click();
  await expect(swatches.nth(1)).toHaveAttribute("aria-pressed", "true");
});
