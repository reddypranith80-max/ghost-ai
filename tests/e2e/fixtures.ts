import { test as base, expect } from "@playwright/test";

/**
 * Every test fails on uncaught page errors and console errors.
 * Ignored (benign): none by default; add narrowly with a reason if needed.
 */
// The browser itself logs the document 404 when a test deliberately visits an unknown URL.
const BENIGN: RegExp[] = [/status of 404.*definitely-not-a-page/];

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        const line = `${m.text()} @ ${m.location().url}`;
        if (m.type() === "error" && !BENIGN.some((r) => r.test(line))) errors.push(`console: ${line}`);
      });
      await use(errors);
      expect(errors, "console/page errors").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

export const DASH_VIEWS = [
  ["Overview", "/dashboard"],
  ["Projects", "/dashboard/projects"],
  ["Agents", "/dashboard/agents"],
  ["Tasks", "/dashboard/tasks"],
  ["Git Log", "/dashboard/git"],
  ["Flow", "/dashboard/flow"],
  ["Exports", "/dashboard/exports"],
  ["Settings", "/dashboard/settings"],
] as const;
