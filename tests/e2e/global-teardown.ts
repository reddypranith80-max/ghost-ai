// Removes the projects the suite created so repeated runs do not pile up in local.db.
export default async function globalTeardown() {
  const base = "http://localhost:3500";
  try {
    const list: { id: string; name: string }[] = await (await fetch(`${base}/api/projects`)).json();
    await Promise.all(list.filter((p) => /^(E2E Proj|Wizard Proj|API Test Project)/.test(p.name)).map((p) => fetch(`${base}/api/projects/${p.id}`, { method: "DELETE" })));
  } catch {
    /* server already gone; nothing to clean */
  }
}
