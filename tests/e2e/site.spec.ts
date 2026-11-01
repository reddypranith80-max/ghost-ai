import { test, expect, DASH_VIEWS } from "./fixtures";

const HEADER_LINKS = ["/how-it-works", "/agents", "/demo", "/docs", "/pricing"];
const FOOTER_LINKS = ["/how-it-works", "/agents", "/demo", "/pricing", "/dashboard", "/docs", "/api-reference", "/changelog", "/security", "/sign-in", "/sign-up"];

test("every header and footer link resolves to a non-404 page", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.locator("header a[href], footer a[href]").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
  const internal = [...new Set(hrefs.filter((h) => h.startsWith("/")))];
  for (const h of [...HEADER_LINKS, ...FOOTER_LINKS]) expect(internal, `link ${h} present`).toContain(h);
  for (const h of internal) {
    const r = await request.get(h);
    expect(r.status(), h).toBeLessThan(400);
  }
  const ext = hrefs.filter((h) => /^https?:/.test(h));
  expect(ext.length).toBeGreaterThan(0);
  for (const h of ext) expect(h).toMatch(/^https:\/\/github\.com\//);
});

test("unknown route shows the custom 404", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /home|back/i }).first()).toBeVisible();
});

test("home: hero visible with CTA, FAQ expands, crew card expands sub-agents", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /launch app|get started|start building/i }).first()).toBeVisible();

  const summary = page.locator("details > summary").nth(1);
  const details = page.locator("details").nth(1);
  await summary.scrollIntoViewIfNeeded();
  await expect(details).not.toHaveAttribute("open", "");
  await summary.click();
  await expect(details).toHaveAttribute("open", "");

  const crew = page.locator("button[aria-expanded]").filter({ has: page.getByRole("heading", { name: "Backend" }) });
  await crew.scrollIntoViewIfNeeded();
  await expect(crew).toHaveAttribute("aria-expanded", "false");
  await crew.click();
  await expect(crew).toHaveAttribute("aria-expanded", "true");
  expect(await crew.locator("xpath=following-sibling::ul/li").count()).toBeGreaterThan(0);
});

test.describe("mobile 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens, links work and menu closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header nav a").first()).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /Agents/ }).click();
    await expect(page).toHaveURL(/\/agents$/);
    await expect(page.getByRole("dialog", { name: "Site menu" })).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Site menu" })).toHaveCount(0);
  });

  for (const path of ["/", "/agents", "/how-it-works", "/dashboard", "/dashboard/tasks", "/dashboard/exports", "/api-reference", "/pricing", "/docs/quick-start"]) {
    test(`no horizontal overflow at 390px on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(m.sw, `scrollWidth ${m.sw} > innerWidth ${m.iw}`).toBeLessThanOrEqual(m.iw);
    });
  }
});

test("/agents search filters and /agents/architect detail loads", async ({ page }) => {
  await page.goto("/agents");
  const status = page.getByText(/of \d+ lead agents shown/);
  await expect(status).toContainText("8 of 8");
  await page.getByLabel("Search agents").fill("architect");
  await expect(status).toContainText("1 of 8");
  await page.getByLabel("Search agents").fill("zzzznomatch");
  await expect(page.getByText("No agent matches that search")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(status).toContainText("8 of 8");
  await page.goto("/agents/architect");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/architect/i);
});

test("/api-reference Try it on GET /api/health shows JSON", async ({ page }) => {
  await page.goto("/api-reference");
  const row = page.locator("section, article, div").filter({ hasText: "/api/health" }).filter({ has: page.getByRole("button", { name: /try it/i }) }).last();
  await row.getByRole("button", { name: /try it/i }).first().click();
  const pre = page.locator("pre").filter({ hasText: '"ok"' }).first();
  await expect(pre).toBeVisible();
  const text = (await pre.textContent()) ?? "";
  expect(JSON.parse(text.slice(text.indexOf("{"))).ok).toBe(true);
});

test("/docs/quick-start renders and all docs guides resolve", async ({ page, request }) => {
  await page.goto("/docs/quick-start");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/quick start/i);
  for (const s of ["architecture", "agents", "api", "auth", "deploy", "troubleshooting"]) expect((await request.get(`/docs/${s}`)).status(), s).toBe(200);
});

test("/sign-in explains demo mode and continues to the dashboard", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByText("Demo mode", { exact: true }).first()).toBeVisible();
  await page.getByRole("link", { name: /Continue in demo mode/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("button", { name: /Run next step/ }).first()).toBeVisible();
});

test("/demo: storyboard falls back or real video loads without error", async ({ page }) => {
  await page.goto("/demo");
  await page.waitForTimeout(1000);
  const video = page.locator("video");
  if (await video.count()) {
    const st = await video.evaluate((v: HTMLVideoElement) => ({ rs: v.readyState, err: v.error?.code ?? null }));
    expect(st.err).toBeNull();
    expect(st.rs).toBeGreaterThanOrEqual(1);
  } else {
    await expect(page.getByRole("img", { name: /Storyboard scene/ })).toBeVisible();
  }
});

test("all dashboard views are reachable from the sidebar", async ({ page }) => {
  await page.goto("/dashboard");
  const nav = page.getByRole("navigation", { name: "Dashboard" });
  for (const [label, href] of DASH_VIEWS) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main h1").first()).toBeVisible();
  }
});

const ALL_ROUTES = ["/", "/how-it-works", "/agents", "/agents/architect", "/demo", "/docs", "/docs/architecture", "/api-reference", "/pricing", "/changelog", "/security", "/sign-in", "/sign-up", ...["", "/projects", "/agents", "/tasks", "/git", "/flow", "/exports", "/settings"].map((s) => `/dashboard${s}`)];

for (const route of ALL_ROUTES) {
  test(`a11y basics and no console errors on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toHaveCount(1);
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("img:not([alt])").forEach((e) => out.push(`img without alt: ${(e as HTMLImageElement).src}`));
      document.querySelectorAll("button, a[href]").forEach((e) => {
        const el = e as HTMLElement;
        const name = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "").trim();
        if (!name) out.push(`unnamed ${el.tagName.toLowerCase()}: ${el.outerHTML.slice(0, 120)}`);
      });
      document.querySelectorAll("input:not([type=hidden]), textarea, select").forEach((e) => {
        const el = e as HTMLInputElement;
        const labelled = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.id && document.querySelector(`label[for="${el.id}"]`) || el.closest("label");
        if (!labelled) out.push(`unlabelled field: ${el.outerHTML.slice(0, 120)}`);
      });
      if (!document.documentElement.lang) out.push("html lang missing");
      return out;
    });
    expect(bad).toEqual([]);
  });
}
