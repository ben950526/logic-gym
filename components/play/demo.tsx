"use client";

import { useEffect, useRef, useState } from "react";
import type { GameKind } from "@/lib/puzzles/save";
import { speak, stopSpeaking } from "@/lib/puzzles/speech";

/**
 * 「看我做一次」：一隻手指自己示範怎麼玩，不識字也看得懂。
 * 每一格畫面（frame）寫好要顯示的狀態、手指位置、一句旁白。
 */

interface NonoFrame { fill: string[]; hand: string; say: string; hi?: string }
interface StrokeFrame { used: number; cur: string | null; hand: string; say: string }
interface SudokuFrame { value: number; sel: boolean; hand: string; say: string }

/* 數織示範：3×3 拼出一個 T */
const NONO_SOL = ["###", ".#.", ".#."];
const NONO_ROWS = [[3], [1], [1]];
const NONO_COLS = [[1], [3], [1]];
const NONO_FRAMES: NonoFrame[] = [
  { fill: [], hand: "r0", hi: "r0", say: "看左邊的數字 3：這一排要塗 3 格。" },
  { fill: ["0-0"], hand: "0-0", hi: "r0", say: "點格子，格子就會塗滿。" },
  { fill: ["0-0", "0-1"], hand: "0-1", hi: "r0", say: "再點一格。" },
  { fill: ["0-0", "0-1", "0-2"], hand: "0-2", hi: "r0", say: "3 格都塗好了！數字變淡，代表這一排對了。" },
  { fill: ["0-0", "0-1", "0-2"], hand: "c1", hi: "c1", say: "再看上面的數字 3：中間這一行也要塗 3 格。" },
  { fill: ["0-0", "0-1", "0-2", "1-1"], hand: "1-1", hi: "c1", say: "往下塗。" },
  { fill: ["0-0", "0-1", "0-2", "1-1", "2-1"], hand: "2-1", hi: "c1", say: "全部數字都對了，拼出一個 T！換你試試看！" },
];

/* 一筆畫示範：三角形加一條尾巴，從尾巴出發 */
const S_NODES: Record<string, [number, number]> = { a: [30, 30], b: [150, 30], c: [90, 100], d: [90, 170] };
const S_EDGES: [string, string][] = [["d", "c"], ["c", "a"], ["a", "b"], ["b", "c"]];
const STROKE_FRAMES: StrokeFrame[] = [
  { used: 0, cur: null, hand: "d", say: "先點一個圓點，當作筆的起點。" },
  { used: 0, cur: "d", hand: "c", say: "再點有線連著的圓點，線就畫好了。" },
  { used: 1, cur: "c", hand: "a", say: "繼續畫，筆不能離開紙。" },
  { used: 2, cur: "a", hand: "b", say: "畫過的線不能再畫。" },
  { used: 3, cur: "b", hand: "c", say: "最後一條！" },
  { used: 4, cur: "c", hand: "c", say: "每一條線都畫過了，過關！換你試試看！" },
];

/* 數獨示範：第一排少一個數字 */
const SUDOKU_GRID = [1, 2, 0, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
const SUDOKU_FRAMES: SudokuFrame[] = [
  { value: 0, sel: false, hand: "row", say: "每一排都要有 1、2、3、4，不能重複。" },
  { value: 0, sel: false, hand: "row", say: "第一排有 1、2、4，少了 3。" },
  { value: 0, sel: true, hand: "cell", say: "先點空格。" },
  { value: 0, sel: true, hand: "pad3", say: "再點數字 3。" },
  { value: 3, sel: false, hand: "cell", say: "填對了！換你試試看！" },
];

const FRAMES: Record<GameKind, { say: string }[]> = { nono: NONO_FRAMES, stroke: STROKE_FRAMES, sudoku: SUDOKU_FRAMES };
const TITLES: Record<GameKind, string> = { nono: "數織怎麼玩", stroke: "一筆畫怎麼玩", sudoku: "數獨怎麼玩" };

const Hand = () => <span className="lgp-hand" aria-hidden="true">👆</span>;

function NonoDemo({ f }: { f: NonoFrame }) {
  return (
    <div className="lgp-nono lgp-demo-board" style={{ "--cs": "44px", gridTemplateColumns: "auto repeat(3, var(--cs))" } as React.CSSProperties}>
      <div />
      {NONO_COLS.map((c, i) => {
        const done = [0, 1, 2].filter((r) => f.fill.includes(`${r}-${i}`)).length === c[0] && NONO_SOL.every((row, r) => (row[i] === "#") === f.fill.includes(`${r}-${i}`));
        return (
          <div key={i} className={`lgp-clue col${done ? " done" : ""}${f.hi === `c${i}` ? " hi" : ""}`} style={{ position: "relative" }}>
            <span>{c[0]}</span>{f.hand === `c${i}` && <Hand />}
          </div>
        );
      })}
      {NONO_ROWS.map((c, r) => {
        const done = NONO_SOL[r].split("").every((ch, i) => (ch === "#") === f.fill.includes(`${r}-${i}`));
        return [
          <div key={`r${r}`} className={`lgp-clue row${done ? " done" : ""}${f.hi === `r${r}` ? " hi" : ""}`} style={{ position: "relative" }}>
            <span>{c[0]}</span>{f.hand === `r${r}` && <Hand />}
          </div>,
          ...[0, 1, 2].map((i) => (
            <div key={`${r}-${i}`} className={`lgp-cell${f.fill.includes(`${r}-${i}`) ? " filled" : ""}`}>
              {f.hand === `${r}-${i}` && <Hand />}
            </div>
          )),
        ];
      })}
    </div>
  );
}

function StrokeDemo({ f }: { f: StrokeFrame }) {
  const [hx, hy] = S_NODES[f.hand];
  return (
    <div className="lgp-demo-board" style={{ position: "relative", width: 180, height: 200 }}>
      <svg viewBox="0 0 180 200" width="180" height="200">
        {S_EDGES.map(([a, b], i) => (
          <line key={i} x1={S_NODES[a][0]} y1={S_NODES[a][1]} x2={S_NODES[b][0]} y2={S_NODES[b][1]} className={i < f.used ? "lgp-edge used" : "lgp-edge"} />
        ))}
        {Object.entries(S_NODES).map(([k, [x, y]]) => (
          <circle key={k} cx={x} cy={y} r={13} className={f.cur === k ? "lgp-node cur" : "lgp-node"} />
        ))}
      </svg>
      <span className="lgp-hand" aria-hidden="true" style={{ left: hx - 6, top: hy + 4 }}>👆</span>
    </div>
  );
}

function SudokuDemo({ f }: { f: SudokuFrame }) {
  return (
    <div className="lgp-demo-board" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div className="lgp-sudoku" style={{ "--ss": "44px", position: "relative" } as React.CSSProperties}>
        {SUDOKU_GRID.map((v, i) => {
          const r = Math.floor(i / 4), c = i % 4, empty = i === 2;
          const cls = `lgp-scell${empty ? "" : " given"}${c === 1 ? " c1" : ""}${r === 1 ? " r1" : ""}${empty && f.sel ? " sel" : ""}${r === 0 && f.hand === "row" ? " hi" : ""}`;
          return (
            <div key={i} className={cls} style={{ position: "relative", display: "grid", placeItems: "center", fontSize: "1.3rem" }}>
              {empty ? (f.value || "") : v}
              {empty && f.hand === "cell" && <Hand />}
              {i === 0 && f.hand === "row" && <Hand />}
            </div>
          );
        })}
      </div>
      <div className="lgp-pad" style={{ width: 220 }}>
        {[1, 2, 3, 4].map((v) => (
          <div key={v} className="lgp-key" style={{ position: "relative", textAlign: "center" }}>
            {v}{v === 3 && f.hand === "pad3" && <Hand />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoOverlay({ game, onClose }: { game: GameKind; onClose: () => void }) {
  const frames = FRAMES[game];
  const [i, setI] = useState(0);
  const [voice, setVoice] = useState(false);
  const last = i === frames.length - 1;
  // 按下「念給我聽」時已經在點擊當下念了（iOS 規定），下一次 effect 就不要重念
  const spokenByClick = useRef(-1);
  const pendingNext = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout> | undefined;
    const next = (delay: number) => {
      if (cancelled || last) return;
      t = setTimeout(() => { if (!cancelled) setI((x) => x + 1); }, delay);
    };
    if (voice) {
      // 念完這一句才換下一步，不會講到一半被切掉
      if (spokenByClick.current === i) {
        spokenByClick.current = -1;
        pendingNext.current = () => next(700);
      } else {
        speak(frames[i].say, () => next(700));
      }
    } else {
      next(2600);
    }
    return () => { cancelled = true; if (t) clearTimeout(t); pendingNext.current = null; };
  }, [i, voice, last, frames]);
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="lgp-overlay">
      <div className="lgp-win lgp-chunky lgp-demo-card" role="dialog" aria-label={TITLES[game]}>
        <h3 style={{ fontSize: "1.3rem" }}>👀 {TITLES[game]}</h3>
        {game === "nono" && <NonoDemo f={NONO_FRAMES[i]} />}
        {game === "stroke" && <StrokeDemo f={STROKE_FRAMES[i]} />}
        {game === "sudoku" && <SudokuDemo f={SUDOKU_FRAMES[i]} />}
        <p className="lgp-demo-say">{frames[i].say}</p>
        <div className="lgp-dots" aria-hidden="true">{frames.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}</div>
        <div className="lgp-keys">
          <button className="lgp-key" aria-pressed={voice} onClick={() => {
            const v = !voice;
            setVoice(v);
            if (v) {
              spokenByClick.current = i;
              speak(frames[i].say, () => pendingNext.current?.());
            } else stopSpeaking();
          }}>
            🔊 {voice ? "朗讀中" : "念給我聽"}
          </button>
          <button className="lgp-key" onClick={() => { stopSpeaking(); setI(0); }}>↺ 再看一次</button>
          <button className="lgp-key go" onClick={() => { stopSpeaking(); onClose(); }}>我會了！</button>
        </div>
      </div>
    </div>
  );
}
