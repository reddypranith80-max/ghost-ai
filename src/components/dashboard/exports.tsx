"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Archive, Check, ChevronDown, ChevronRight, Download, FileText, Folder, FolderDown, FolderOpen } from "lucide-react";
import { cn } from "cn";
import {
  EXPORT_GROUPS, buildExport, buildTree, byteLen, canPickFolder, downloadFile, downloadZip, fmtBytes, saveToFolder, slug, type ExportFile, type ExportGroup, type TreeNode,
} from "@/lib/export";
import { useDash } from "./store";
import { NeedProject, PageHead, Panel, field, hud } from "./kit";

type Done = { at: string; mode: string; target: string; count: number; bytes: number };

export function ExportsView() {
  const { project, toast, addNote } = useDash();
  const [groups, setGroups] = useState<ExportGroup[]>(EXPORT_GROUPS.map((g) => g.id));
  const [folder, setFolder] = useState("");
  const [sel, setSel] = useState<string>("README.md");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<Done[]>([]);
  const [busy, setBusy] = useState(false);
  const fsOk = useSyncExternalStore(() => () => {}, canPickFolder, () => false);

  const files = useMemo<ExportFile[]>(() => (project ? buildExport(project, groups) : []), [project, groups]);
  if (!project) return <NeedProject />;
  const root = (folder.trim() && slug(folder)) || slug(project.name);
  const tree = buildTree(files, root);
  const total = files.reduce((s, f) => s + byteLen(f.content), 0);
  const current = files.find((f) => f.path === sel) ?? files[0];
  const toggle = (g: ExportGroup) => setGroups((l) => (l.includes(g) ? l.filter((x) => x !== g) : [...l, g]));
  const record = (mode: string, target: string) => setHistory((h) => [{ at: new Date().toISOString().slice(11, 19), mode, target, count: files.length, bytes: total }, ...h].slice(0, 6));

  async function toFolder() {
    setBusy(true);
    try {
      const r = await saveToFolder(files, root);
      toast({ title: `Saved ${r.written.length} files to ${r.folder}`, files: r.written, kind: "ok" });
      addNote(`Exported ${project!.name} to ${r.folder}`, "ok");
      record("Folder", r.folder);
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast({ title: "Could not write to folder", body: (e as Error).message, kind: "warn" });
    } finally { setBusy(false); }
  }
  function toZip() {
    downloadZip(files, root);
    toast({ title: `${root}.zip downloaded`, body: `${files.length} files, ${fmtBytes(total)} (store-only zip)`, files: files.map((f) => f.path), kind: "ok" });
    addNote(`Downloaded ${root}.zip`, "ok");
    record("ZIP", `${root}.zip`);
  }

  const renderNode = (n: TreeNode, depth: number): React.ReactNode => {
    const isDir = !!n.children;
    const open = !collapsed.has(n.path + n.name);
    return (
      <li key={n.path + n.name}>
        <button
          onClick={() => (isDir ? setCollapsed((s) => { const x = new Set(s); const k = n.path + n.name; if (!x.delete(k)) x.add(k); return x; }) : setSel(n.path))}
          className={cn("flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left font-mono text-xs hover:bg-white/5", !isDir && current?.path === n.path && "bg-[color-mix(in_srgb,var(--acc)_16%,transparent)]")}
          style={{ paddingLeft: 6 + depth * 14 }}
        >
          {isDir ? (open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />) : <span className="w-3" />}
          {isDir ? (open ? <FolderOpen className="size-3.5 text-amber-300" /> : <Folder className="size-3.5 text-amber-300" />) : <FileText className="size-3.5 text-sky-300" />}
          <span className="min-w-0 flex-1 truncate">{n.name}{isDir && "/"}</span>
          <span className="text-[10px] text-muted-foreground">{fmtBytes(n.size)}</span>
        </button>
        {isDir && open && <ul>{n.children!.map((c) => renderNode(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <>
      <PageHead kicker={`Deliver / ${project.name}`} title="Exports">
        <button onClick={() => void toFolder()} disabled={!files.length || busy || !fsOk} className="gh-btn gh-btn-primary" title={fsOk ? "Write real files into a folder you choose" : "Needs Chrome or Edge (File System Access API)"}>
          <FolderDown className="size-4" /> {busy ? "Writing..." : "Save to folder..."}
        </button>
        <button onClick={toZip} disabled={!files.length} className="gh-btn gh-btn-ghost"><Archive className="size-4" /> Download .zip</button>
      </PageHead>

      {!fsOk && (
        <p className="mb-3 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Folder saving needs the File System Access API (Chrome / Edge on desktop). Use the .zip or per-file downloads here.
        </p>
      )}

      <div className="grid gap-3.5 lg:grid-cols-[17rem_1fr] xl:grid-cols-[17rem_20rem_1fr]">
        <Panel title="What to include" icon={<Check />} className="xl:row-span-1">
          <ul className="grid gap-1.5">
            {EXPORT_GROUPS.map((g) => (
              <li key={g.id}>
                <label className={cn("flex cursor-pointer items-start gap-2.5 rounded-md border p-2 text-sm", groups.includes(g.id) ? "border-[var(--acc)]/50 bg-[color-mix(in_srgb,var(--acc)_8%,transparent)]" : "border-[var(--gh-line)]")}>
                  <input type="checkbox" checked={groups.includes(g.id)} onChange={() => toggle(g.id)} className="mt-1 accent-[var(--acc)]" />
                  <span><span className="block font-medium">{g.label}</span><span className="text-xs text-muted-foreground">{g.hint}</span></span>
                </label>
              </li>
            ))}
          </ul>
          <label className="mt-3 grid gap-1"><span className={hud}>Folder name</span>
            <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder={slug(project.name)} className={field} aria-label="Folder name" />
          </label>
          {history.length > 0 && (
            <div className="mt-4">
              <div className={cn(hud, "mb-1.5")}>This session</div>
              <ul className="grid gap-1 font-mono text-[11px] text-muted-foreground">
                {history.map((h, i) => <li key={i} className="truncate"><span className="text-emerald-400">OK</span> {h.at} {h.mode} - {h.count} files, {fmtBytes(h.bytes)}</li>)}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title={`File tree (${files.length} files, ${fmtBytes(total)})`} icon={<Folder />} bodyClass="p-2">
          {files.length ? <ul>{renderNode(tree, 0)}</ul> : <p className="p-4 text-center text-sm text-muted-foreground">Tick at least one item to preview the bundle.</p>}
        </Panel>

        <Panel
          title={current ? `Preview / ${current.path}` : "Preview"} icon={<FileText />} className="lg:col-span-2 xl:col-span-1"
          right={current && <button onClick={() => { downloadFile(current); toast({ title: `Downloaded ${current.path.split("/").pop()}`, kind: "ok" }); }} className="flex items-center gap-1 text-[11px] text-[var(--acc)] hover:underline"><Download className="size-3.5" /> Download</button>}
          bodyClass="p-0"
        >
          {current ? (
            <pre className="max-h-[32rem] min-h-72 overflow-auto whitespace-pre p-3 font-mono text-[11px] leading-relaxed text-slate-300">{current.content.slice(0, 12000)}{current.content.length > 12000 && "\n... (truncated in preview, full file is exported)"}</pre>
          ) : <p className="p-6 text-center text-sm text-muted-foreground">Nothing selected.</p>}
        </Panel>
      </div>
    </>
  );
}
