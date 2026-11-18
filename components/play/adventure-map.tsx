"use client";

import { useEffect, useRef } from "react";
import {
  CHAPTER_HEIGHT, chapterTheme, chapterTitle, nodeAt, nodePos, NODES_PER_CHAPTER, type ChapterTheme,
} from "@/lib/puzzles/adventure";
import { seededRng } from "@/lib/puzzles/random";

const INK = "#23305a";
const GAME_ICON = { nono: "🧩", stroke: "✏️", sudoku: "🔢" } as const;
const GAME_NAME = { nono: "數織", stroke: "一筆畫", sudoku: "數獨" } as const;

/** 路邊的小裝飾，全部用程式畫（viewBox 0 0 40 40） */
function decorSvg(kind: ChapterTheme["decor"], variant: number): string {
  switch (kind) {
    case "meadow":
      return variant % 2
        ? `<circle cx="20" cy="22" r="8" fill="#ff8fb1" stroke="${INK}" stroke-width="2"/><circle cx="20" cy="22" r="3" fill="#ffc93c"/><path d="M20 30 v8" stroke="#2fbf8a" stroke-width="3"/>`
        : `<path d="M6 36 q4 -14 6 0 q4 -18 8 0 q4 -14 8 0" fill="#5fd3a8" stroke="${INK}" stroke-width="2"/>`;
    case "forest":
      return variant % 2
        ? `<rect x="17" y="24" width="6" height="12" fill="#a5794a" stroke="${INK}" stroke-width="2"/><circle cx="20" cy="18" r="12" fill="#2fbf8a" stroke="${INK}" stroke-width="2"/>`
        : `<path d="M8 22 q12 -18 24 0 z" fill="#ff5d73" stroke="${INK}" stroke-width="2"/><circle cx="14" cy="17" r="2" fill="#fff"/><circle cx="23" cy="15" r="2.5" fill="#fff"/><rect x="16" y="22" width="8" height="12" rx="3" fill="#fff6dc" stroke="${INK}" stroke-width="2"/>`;
    case "beach":
      return variant % 2
        ? `<path d="M4 28 q6 -6 12 0 q6 6 12 0 q6 -6 12 0" fill="none" stroke="#4d9fff" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M20 36 v-20" stroke="#a5794a" stroke-width="4"/><path d="M20 16 q-12 -6 -16 4 M20 16 q12 -6 16 4 M20 16 q-4 -12 -14 -10 M20 16 q4 -12 14 -10" fill="none" stroke="#2fbf8a" stroke-width="4" stroke-linecap="round"/>`;
    case "snow":
      return variant % 2
        ? `<path d="M4 36 l12 -24 l8 14 l4 -6 l8 16 z" fill="#fff" stroke="${INK}" stroke-width="2"/>`
        : `<path d="M20 8 v24 M9 14 l22 12 M9 26 l22 -12" stroke="#4d9fff" stroke-width="3" stroke-linecap="round"/>`;
    case "volcano":
      return variant % 2
        ? `<path d="M4 36 l10 -20 h12 l10 20 z" fill="#b8664a" stroke="${INK}" stroke-width="2"/><path d="M15 16 q5 -10 10 0" fill="#ff5d73"/>`
        : `<ellipse cx="20" cy="30" rx="14" ry="7" fill="#9aa6d6" stroke="${INK}" stroke-width="2"/>`;
    case "space":
      return variant % 2
        ? `<path d="M20 4 l4 10 l11 1 l-8 7 l3 11 l-10 -6 l-10 6 l3 -11 l-8 -7 l11 -1 z" fill="#ffc93c" stroke="${INK}" stroke-width="2"/>`
        : `<circle cx="20" cy="20" r="10" fill="#a68bff" stroke="${INK}" stroke-width="2"/><ellipse cx="20" cy="20" rx="17" ry="5" fill="none" stroke="${INK}" stroke-width="2"/>`;
  }
}

interface Props {
  adv: number;
  onOpen: (k: number) => void;
}

export function AdventureMap({ adv, onOpen }: Props) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const currentChapter = Math.floor(adv / NODES_PER_CHAPTER);
  const chapters = Array.from({ length: currentChapter + 2 }, (_, c) => c);

  useEffect(() => {
    // 只在目前這一關不在畫面裡時才捲過去（第一關通常已經看得到，不要一開頁就亂捲）
    const el = currentRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: "auto" });
  }, [adv]);

  return (
    <div className="lgp-map">
      {chapters.map((c) => {
        const theme = chapterTheme(c);
        const locked = c > currentChapter;
        const first = c * NODES_PER_CHAPTER;
        const done = Math.max(0, Math.min(NODES_PER_CHAPTER, adv - first));
        const ks = Array.from({ length: NODES_PER_CHAPTER }, (_, s) => first + s);
        const pts = ks.map((k) => nodePos(k));
        const rng = seededRng(c + 7);
        const decor = Array.from({ length: 9 }, (_, d) => ({
          left: rng() < 0.5 ? 2 + rng() * 10 : 86 + rng() * 10,
          top: 70 + d * ((CHAPTER_HEIGHT - 110) / 9) + rng() * 30,
          v: Math.floor(rng() * 2),
        }));
        return (
          <section key={c} className={locked ? "lgp-chapter locked" : "lgp-chapter"} style={{ background: theme.ground, height: locked ? 300 : CHAPTER_HEIGHT }}>
            <header className="lgp-chapter-head">
              <span>{chapterTitle(c)}</span>
              <span className="lgp-chapter-count">{locked ? "🔒 打倒上一章 BOSS 解鎖" : `${done}/${NODES_PER_CHAPTER}`}</span>
            </header>
            {decor.map((d, i) => (
              <svg key={i} className="lgp-decor" viewBox="0 0 40 40" style={{ left: `${d.left}%`, top: d.top }} aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: decorSvg(theme.decor, d.v + i) }} />
            ))}
            <svg className="lgp-trail" viewBox={`0 0 100 ${CHAPTER_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={theme.path} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {ks.map((k) => {
              const n = nodeAt(k);
              const p = nodePos(k);
              const state = k < adv ? "done" : k === adv ? "current" : "locked";
              const icon = n.boss ? "👑" : GAME_ICON[n.game];
              const label = `${n.boss ? "BOSS · " : ""}${GAME_NAME[n.game]}`;
              return (
                <div key={k} className="lgp-node-wrap" style={{ left: `${p.x}%`, top: p.y }}>
                  <button
                    ref={state === "current" ? currentRef : undefined}
                    className={`lgp-stop ${state}${n.boss ? " boss" : ""}`}
                    disabled={state === "locked"}
                    aria-label={`第 ${k + 1} 關 ${label}${state === "done" ? "（已過關）" : state === "locked" ? "（還沒解鎖）" : ""}`}
                    onClick={() => onOpen(k)}
                  >
                    <span className="ic">{state === "locked" ? "🔒" : icon}</span>
                    {state === "done" && <span className="lgp-stop-check">✓</span>}
                  </button>
                  <span className="lgp-stop-label">{state === "current" ? "▶ " : ""}{k + 1}</span>
                </div>
              );
            })}
          </section>
        );
      })}
      <p className="lgp-note" style={{ textAlign: "center" }}>路還很長，一直走下去會遇到更多章節！</p>
    </div>
  );
}
