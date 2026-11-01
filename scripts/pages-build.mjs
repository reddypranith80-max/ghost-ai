// Static GitHub Pages build: API routes and the Clerk proxy cannot be exported,
// so move them aside, build, and always restore.
import { renameSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const stash = join(root, ".pages-stash");
const targets = [
  ["src/app/api", "api"],
  ["src/proxy.ts", "proxy.ts"],
  ["src/middleware.ts", "middleware.ts"],
];
// A second concurrent run would find the API already stashed, move nothing, then delete the stash.
if (existsSync(stash)) {
  console.error("Another pages build is running, or one crashed: .pages-stash exists. If it crashed, move its contents back into src/ and delete .pages-stash.");
  process.exit(1);
}
const moved = [];
let code = 1;

try {
  mkdirSync(stash, { recursive: true });
  for (const [rel, name] of targets) {
    const from = join(root, rel);
    if (existsSync(from)) {
      renameSync(from, join(stash, name));
      moved.push([from, join(stash, name)]);
    }
  }
  const env = { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO ?? "1" };
  const r = spawnSync("npx", ["next", "build"], { stdio: "inherit", env, shell: true, cwd: root });
  code = r.status ?? 1;
} finally {
  for (const [from, tmp] of moved.reverse()) {
    if (existsSync(tmp)) renameSync(tmp, from);
  }
  if (moved.every(([, tmp]) => !existsSync(tmp))) rmSync(stash, { recursive: true, force: true });
}
process.exit(code);
