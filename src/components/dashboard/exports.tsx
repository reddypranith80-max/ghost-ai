"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Archive, Check, ChevronDown, ChevronRight, Download, FileText, Folder, FolderDown, FolderOpen } from "lucide-react";
import { cn } from "cn";
import {
  EXPORT_GROUPS, buildExport, buildTree, byteLen, canPickFolder, downloadFile, downloadZip, fmtBytes, saveToFolder, slug, type ExportFile, type ExportGroup, type TreeNode,
} from "@/lib/export";
import { useDash } from "./store";
import { NeedProject, PageHead, Panel, field, lbl } from "./kit";

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
          className={cn("flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] transition-colors duration-150 hover:bg-white/[0.05]", !isDir && current?.path === n.path && "bg-white/[0.08] text-foreground")}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {isDir ? (open ? <ChevronDown className="size-3 text-[var(--text-faint)]" /> : <ChevronRight className="size-3 text-[var(--text-faint)]" />) : <span className="w-3" />}
          {isDir ? (open ? <FolderOpen className="size-4 text-[var(--amber)]" /> : <Folder className="size-4 text-[var(--amber)]" />) : <FileText className="size-4 text-[var(--blue)]" />}
          <span className="min-w-0 flex-1 truncate">{n.name}{isDir && "/"}</span>
          <span className="text-[11px] tabular-nums text-[var(--text-faint)]">{fmtBytes(n.size)}</span>
        </button>
        {isDir && open && <ul>{n.children!.map((c) => renderNode(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <>
      <PageHead title="Exports" description={`Bundle ${project.name} as real files: pick what to include, preview, then save to a folder or download a zip.`}>
        <button onClick={toZip} disabled={!files.length} className="btn btn-secondary disabled:opacity-50"><Archive className="size-4" /> Download .zip</button>
        <button onClick={() => void toFolder()} disabled={!files.length || busy || !fsOk} className="btn btn-primary disabled:opacity-50" title={fsOk ? "Write real files into a folder you choose" : "Needs Chrome or Edge (File System Access API)"}>
          <FolderDown className="size-4" /> {busy ? "Writing..." : "Save to folder..."}
        </button>
      </PageHead>

      {!fsOk && (
        <p className="mb-5 rounded-xl bg-[var(--amber-tint)] px-4 py-3 text-[13px] leading-relaxed text-[var(--amber)]">
          Folder saving needs the File System Access API (Chrome / Edge on desktop). Use the .zip or per-file downloads here.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr] xl:grid-cols-[18rem_21rem_1fr]">
        <Panel title="What to include" icon={<Check />} className="reveal reveal-1">
          <ul className="grid gap-1.5">
            {EXPORT_GROUPS.map((g) => (
              <li key={g.id}>
                <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm transition-colors duration-150", groups.includes(g.id) ? "bg-[var(--mint-tint)]" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
                  <input type="checkbox" checked={groups.includes(g.id)} onChange={() => toggle(g.id)} className="mt-1 size-4 accent-[var(--mint)]" />
                  <span><span className="block font-medium">{g.label}</span><span className="text-xs leading-snug text-[var(--text-muted)]">{g.hint}</span></span>
                </label>
              </li>
            ))}
          </ul>
          <label className="mt-5 grid gap-1.5"><span className={lbl}>Folder name</span>
            <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder={slug(project.name)} className={cn(field, "h-10")} aria-label="Folder name" />
          </label>
          {history.length > 0 && (
            <div className="mt-6">
              <div className={cn(lbl, "mb-2")}>This session</div>
              <ul className="grid gap-1.5 text-xs text-[var(--text-muted)]">
                {history.map((h, i) => <li key={i} className="flex items-center gap-2 truncate"><Check className="size-3.5 shrink-0 text-[var(--mint)]" /><span className="truncate">{h.at} · {h.mode} · {h.count} files, {fmtBytes(h.bytes)}</span></li>)}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title={`File tree (${files.length} files, ${fmtBytes(total)})`} icon={<Folder />} className="reveal reveal-2" bodyClass="!px-2.5">
          {files.length ? <ul>{renderNode(tree, 0)}</ul> : <p className="p-6 text-center text-sm text-[var(--text-muted)]">Tick at least one item to preview the bundle.</p>}
        </Panel>

        <Panel
          title={current ? `Preview / ${current.path}` : "Preview"} icon={<FileText />} className="reveal reveal-3 lg:col-span-2 xl:col-span-1"
          right={current && <button onClick={() => { downloadFile(current); toast({ title: `Downloaded ${current.path.split("/").pop()}`, kind: "ok" }); }} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--mint)]"><Download className="size-3.5" /> Download</button>}
          bodyClass="!p-2 !pt-2"
        >
          {current ? (
            <pre className="surface-inset max-h-[32rem] min-h-72 overflow-auto whitespace-pre p-4 font-mono text-[11.5px] leading-relaxed text-[var(--text-muted)]">{current.content.slice(0, 12000)}{current.content.length > 12000 && "\n... (truncated in preview, full file is exported)"}</pre>
          ) : <p className="p-8 text-center text-sm text-[var(--text-muted)]">Nothing selected.</p>}
        </Panel>
      </div>
    </>
  );
}
