"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { Panel, btnPrimary, basePath } from "./ui";

const SRC = `${basePath}/demo/ghost-ai-demo.webm`;
const POSTER = `${basePath}/demo/poster.png`;

const SCENES = [
  { t: 0, title: "Write a brief", caption: "Describe the SaaS you want and pick a stack.", lines: ["> name: Acme CRM", "> brief: CRM for small agencies with pipelines", "> stack: Next.js, Clerk, Drizzle"], agents: [] as number[] },
  { t: 8, title: "Architect plans", caption: "ATLAS splits the brief into 6 modules and 24 tasks.", lines: ["ADR-001 accepted: libSQL + Drizzle", "contract: 13 endpoints drafted", "tasks created: 24"], agents: [0] },
  { t: 16, title: "Parallel build", caption: "FORGE and PRISM commit code at the same time.", lines: ["a1f3c9d feat(api): projects routes", "b72e0a1 feat(ui): task board", "c18e77a feat(db): migrations"], agents: [1, 2] },
  { t: 26, title: "Verify and harden", caption: "HELM, ECHO and AEGIS add CI, tests and security headers.", lines: ["ci: workflow green", "e2e: 18 passed", "audit: 0 high, 0 critical"], agents: [3, 4, 5] },
  { t: 36, title: "Review and ship", caption: "JUDGE checks the definition of done and says Go.", lines: ["VERDICT: GO", "0 blocking findings", "export: project.md ready"], agents: [7] },
];
const NAMES = ["Architect", "Backend", "Frontend", "DevOps", "QA", "Security", "Docs", "Reviewer"];
const SCENE_MS = 4500;

const SCRIPT = `# Ghost AI demo storyboard\n\n${SCENES.map((s, i) => `${i + 1}. ${s.title} (${s.t}s): ${s.caption}`).join("\n")}\n`;

export function DemoPlayer() {
  const vref = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    let live = true;
    fetch(SRC, { method: "HEAD" }).then((r) => { if (live && !r.ok) setHasVideo(false); }).catch(() => { if (live) setHasVideo(false); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (hasVideo || !playing) return;
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(id);
  }, [hasVideo, playing, scene]);

  function seek(i: number) {
    if (hasVideo && vref.current) { vref.current.currentTime = SCENES[i].t; void vref.current.play().catch(() => {}); }
    setScene(i);
  }
  const s = SCENES[scene];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <Panel className="p-3">
          {hasVideo ? (
            <video ref={vref} controls preload="metadata" poster={POSTER} src={SRC} onError={() => setHasVideo(false)} onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime; let idx = 0;
              SCENES.forEach((x, i) => { if (t >= x.t) idx = i; });
              setScene(idx);
            }} className="aspect-video w-full rounded bg-black" />
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded bg-[#05060d]" role="img" aria-label={`Storyboard scene ${scene + 1}: ${s.title}`}>
              <div className="gh-grid absolute inset-0 opacity-40" />
              <div className="relative flex h-full flex-col justify-between p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="gh-hud">Storyboard // scene {scene + 1} of {SCENES.length}</span>
                  <button type="button" onClick={() => setPlaying((p) => !p)} className="inline-flex items-center gap-1 rounded border border-[var(--gh-line)] px-2 py-1 text-xs text-white/80 hover:bg-white/10" aria-label={playing ? "Pause storyboard" : "Play storyboard"}>
                    {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}{playing ? "Pause" : "Play"}
                  </button>
                </div>
                <div key={scene} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="text-xl font-semibold text-white sm:text-3xl">{s.title}</h3>
                  <p className="mt-1 text-xs text-[var(--gh-text-dim)] sm:text-sm">{s.caption}</p>
                  <pre className="mt-3 overflow-hidden rounded border border-[var(--gh-line)] bg-black/50 p-3 text-[11px] leading-relaxed text-cyan-200 sm:text-xs">{s.lines.join("\n")}</pre>
                </div>
                <div className="flex flex-wrap gap-1">
                  {NAMES.map((n, i) => (
                    <span key={n} className={`rounded border px-1.5 py-0.5 text-[10px] transition-colors sm:text-xs ${s.agents.includes(i) ? "border-cyan-300 bg-cyan-300/20 text-cyan-100" : "border-[var(--gh-line)] text-[var(--gh-text-dim)]"}`}>{n}</span>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"><div className="h-full bg-cyan-300 transition-all duration-500" style={{ width: `${((scene + 1) / SCENES.length) * 100}%` }} /></div>
              </div>
            </div>
          )}
        </Panel>
        <p className="mt-2 text-xs text-[var(--gh-text-dim)]">{hasVideo ? "Recorded walkthrough." : "The recorded video is not available yet, so a scripted storyboard plays instead."}</p>
      </div>

      <div>
        <Panel>
          <h3 className="gh-hud mb-3">Chapters</h3>
          <ol className="space-y-1.5">
            {SCENES.map((c, i) => (
              <li key={c.title}>
                <button type="button" onClick={() => seek(i)} aria-current={i === scene} className={`flex w-full items-start gap-3 rounded border px-3 py-2 text-left text-sm transition-colors ${i === scene ? "border-cyan-400/60 bg-cyan-400/10 text-white" : "border-[var(--gh-line)] text-white/80 hover:bg-white/5"}`}>
                  <span className="font-mono text-xs text-cyan-300">{String(Math.floor(c.t / 60)).padStart(1, "0")}:{String(c.t % 60).padStart(2, "0")}</span>
                  <span>{c.title}<span className="block text-xs text-[var(--gh-text-dim)]">{c.caption}</span></span>
                </button>
              </li>
            ))}
          </ol>
        </Panel>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/dashboard" className={btnPrimary}>Try the live dashboard</Link>
          <a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(SCRIPT)}`} download="ghost-ai-storyboard.md" className="inline-flex items-center gap-2 text-sm text-cyan-300 underline"><Download className="size-4" />Download storyboard script</a>
          {hasVideo && <a href={SRC} download className="inline-flex items-center gap-2 text-sm text-cyan-300 underline"><Download className="size-4" />Download video (.webm)</a>}
          {hasVideo && <a href={POSTER} download className="inline-flex items-center gap-2 text-sm text-cyan-300 underline"><Download className="size-4" />Download poster (.png)</a>}
        </div>
      </div>
    </div>
  );
}
