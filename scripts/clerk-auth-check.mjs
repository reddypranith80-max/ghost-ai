/**
 * Real Clerk sign-up check. Needs Clerk keys in .env.local and the app running (BASE_URL, default :3210).
 * Uses a +clerk_test email (code 424242) and @clerk/testing's token to pass bot protection. Creates and deletes its own data.
 *   npm run test:clerk            (BASE_URL=http://localhost:3000 npm run test:clerk)
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";
import { config } from "dotenv";
config({ path: ".env.local" });
console.log("setup..."); await clerkSetup(); console.log("testing token ready");
const base = process.env.BASE_URL || "http://localhost:3210";
const email = `ghostqa${Date.now()}+clerk_test@example.com`;
const password = "Gh0st!Qa-7vXk#" + Math.random().toString(36).slice(2, 8);
mkdirSync("test-results", { recursive: true });
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await setupClerkTestingToken({ page: p });
const errs = []; p.on("pageerror", e => errs.push(String(e).slice(0, 160)));
const step = (n, ok, extra = "") => console.log(`${ok ? "PASS" : "FAIL"}  ${n} ${extra}`);

await p.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await p.waitForURL(/sign-in/, { timeout: 20000 }).catch(() => {});
step("unauthenticated /dashboard redirects to /sign-in", /sign-in/.test(p.url()));

await p.goto(base + "/sign-up", { waitUntil: "domcontentloaded" });
await p.locator('input[name="emailAddress"]').waitFor({ timeout: 30000 });
await p.fill('input[name="emailAddress"]', email);
await p.fill('input[name="password"]', password);
await p.locator("button.cl-formButtonPrimary").click();
const otp = p.locator('input[name="codeInput"], input[autocomplete="one-time-code"], input[inputmode="numeric"]').first();
const gotOtp = await otp.waitFor({ timeout: 25000 }).then(() => true).catch(() => false);
step("email verification step shown", gotOtp);
if (gotOtp) { await otp.click(); await p.keyboard.type("424242", { delay: 120 }); }
await p.waitForURL(/\/dashboard/, { timeout: 40000 }).catch(() => {});
step("signed up and landed on /dashboard", /\/dashboard/.test(p.url()), p.url());
await p.waitForTimeout(6000);
await p.screenshot({ path: "test-results/clerk-dashboard-signedin.png" });

const hasUserBtn = await p.locator(".cl-userButtonTrigger, .cl-userButtonBox, [data-clerk-component='UserButton']").first().isVisible().catch(() => false);
step("UserButton visible in the header", hasUserBtn);

const r = await p.evaluate(async () => {
  const res = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Clerk QA project", brief: "Created by the signed-in e2e check.", stack: ["Next.js", "Clerk"] }) });
  return { status: res.status, body: await res.json().catch(() => null) };
});
step("signed-in POST /api/projects is allowed", r.status === 201, `status ${r.status}`);
const pid = r.body && r.body.id;
const list = await p.evaluate(async () => (await (await fetch("/api/projects")).json()).map(x => x.name));
step("new project listed for this user", list.includes("Clerk QA project"), JSON.stringify(list));
if (pid) { const d = await p.evaluate(async id => (await fetch("/api/projects/" + id, { method: "DELETE" })).status, pid); step("cleanup DELETE", d === 200, `status ${d}`); }

await p.evaluate(async () => { await window.Clerk.signOut(); });
await p.waitForTimeout(2500);
await p.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
await p.waitForURL(/sign-in/, { timeout: 20000 }).catch(() => {});
step("after sign-out /dashboard is protected again", /sign-in/.test(p.url()));
const anon = await p.evaluate(async () => (await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status);
step("after sign-out POST /api/projects is 401", anon === 401, `status ${anon}`);
console.log("pageerrors:", errs.length ? errs : "none");
process.exitCode = process.exitCode || 0;
await b.close();
