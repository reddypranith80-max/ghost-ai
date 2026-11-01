// Windows-only workaround for a Next.js static-export bug: segment prefetch files are written as
// "__next.a/b/__PAGE__.txt" (nested) because path.join yields backslashes, but the client requests the
// flat name "__next.a.b.__PAGE__.txt". On Linux (CI) Next emits the flat names itself; this is a no-op there.
import { pathToFileURL } from "node:url";
import { readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
}
function walk(dir) {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (e.name.startsWith("__next.")) {
      for (const f of files(p)) {
        renameSync(f, join(dir, `${e.name}.${relative(p, f).split(sep).join(".")}`));
        n++;
      }
      rmSync(p, { recursive: true, force: true });
    } else n += walk(p);
  }
  return n;
}
export function fixWindowsExport(outDir) {
  if (process.platform !== "win32" || !statSync(outDir, { throwIfNoEntry: false })?.isDirectory()) return 0;
  return walk(outDir);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(`flattened ${fixWindowsExport(process.argv[2] ?? "out")} segment files`);
