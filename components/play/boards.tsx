"use client";

import { useMemo, useRef, useState } from "react";
import { HowTo } from "@/components/play/how-to";
import { isSolved, isUnique, makeRandom, runs, type NonogramPuzzle } from "@/lib/puzzles/nonogram";
import { picturePuzzle, type Picture } from "@/lib/puzzles/pictures";
import { randInt } from "@/lib/puzzles/random";
import { sfx } from "@/lib/puzzles/sound";
import { hasEulerPath, makeStroke } from "@/lib/puzzles/stroke";
import { countSolutions, hasConflict, makeSudoku } from "@/lib/puzzles/sudoku";

export interface WinInfo {
  title: string;
  text: string;
  picture?: Picture;
}

interface BoardProps {
  level: number;
  howtoOpen: boolean;
  onWin: (w: WinInfo) => void;
  onOops: () => void;
  onDemo: () => void;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sameClue = (a: number[], b: number[]) => a.join() === b.join();

function shake(el: Element | null) {
  if (!el) return;
  el.classList.remove("lgp-shake");
  void (el as HTMLElement).getBoundingClientRect();
  el.classList.add("lgp-shake");
}

/* ───────── 數織 ───────── */
export function NonogramBoard(props: BoardProps & { picture?: Picture; dexIndex: number; dexTotal: number }) {
  // 題目在這一題開始時就固定，過關後進度更新也不會換題
  const [{ level, picture, dexIndex, dexTotal }] = useState(() => props);
  const { howtoOpen, onWin, onDemo } = props;
  const [puzzle] = useState<NonogramPuzzle>(() => {
    if (picture) return picturePuzzle(picture);
    const n = 5 + Math.min(2, Math.floor(Math.max(0, level - 1) / 4));
    return makeRandom(n);
  });
  const unique = useMemo(() => isUnique(puzzle), [puzzle]);
  const n = puzzle.n;
  const [state, setState] = useState<number[][]>(() => puzzle.solution.map((r) => r.map(() => 0)));
  const [xMode, setXMode] = useState(false);
  const [done, setDone] = useState(false);
  const cs = typeof window === "undefined" ? 40 : Math.max(30, Math.min(46, Math.floor((Math.min(window.innerWidth, 540) - 130) / (n + 1.6))));

  const apply = (next: number[][]) => {
    setState(next);
    if (isSolved(next, puzzle)) {
      setDone(true);
      const info: WinInfo = picture
        ? { title: "拼出來了！", text: `你拼出了「${picture.name}」，收進圖鑑了！`, picture }
        : { title: "拼出來了！", text: "挑戰題完成！" };
      setTimeout(() => onWin(info), reducedMotion() ? 0 : 700);
    }
  };
  const tap = (r: number, c: number) => {
    if (done) return;
    const next = state.map((row) => row.slice());
    const before = next[r][c];
    next[r][c] = xMode ? (before === 2 ? 0 : 2) : before === 1 ? 0 : 1;
    (next[r][c] === 0 ? sfx.erase : sfx.tap)();
    apply(next);
  };
  const hint = () => {
    if (done) return;
    const wrong: [number, number][] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if ((state[r][c] === 1) !== (puzzle.solution[r][c] === 1)) wrong.push([r, c]);
    if (!wrong.length) return;
    const [r, c] = wrong[randInt(wrong.length)];
    const next = state.map((row) => row.slice());
    next[r][c] = puzzle.solution[r][c] === 1 ? 1 : 2;
    sfx.tap();
    apply(next);
  };

  return (
    <>
      <div className="lgp-head">
        <h2>🧩 數織</h2>
        <span className="lgp-qno">{picture ? `圖鑑 ${dexIndex}/${dexTotal}` : `挑戰題 ${level}`} · {n}×{n}</span>
      </div>
      <HowTo game="nono" open={howtoOpen} onDemo={onDemo} />
      <div className={done ? "lgp-nono solved" : "lgp-nono"} style={{ "--cs": `${cs}px`, "--pic": picture?.color ?? "#7c5cff", gridTemplateColumns: `auto repeat(${n}, var(--cs))` } as React.CSSProperties}>
        <div />
        {puzzle.colClues.map((clue, c) => (
          <div key={`c${c}`} className={sameClue(runs(state.map((row) => row[c] === 1)), clue) ? "lgp-clue col done" : "lgp-clue col"}>
            {(clue.length ? clue : [0]).map((x, i) => <span key={i}>{x}</span>)}
          </div>
        ))}
        {state.map((row, r) => [
          <div key={`r${r}`} className={sameClue(runs(row.map((v) => v === 1)), puzzle.rowClues[r]) ? "lgp-clue row done" : "lgp-clue row"}>
            {(puzzle.rowClues[r].length ? puzzle.rowClues[r] : [0]).map((x, i) => <span key={i}>{x}</span>)}
          </div>,
          ...row.map((v, c) => (
            <button
              key={`${r}-${c}`}
              className={`lgp-cell${v === 1 ? " filled" : ""}${v === 2 ? " x" : ""}`}
              style={{ "--d": r + c } as React.CSSProperties}
              aria-label={`第 ${r + 1} 列第 ${c + 1} 格`}
              onClick={() => tap(r, c)}
            />
          )),
        ])}
      </div>
      <div className="lgp-keys">
        <button className="lgp-key" aria-pressed={xMode} onClick={() => { setXMode(!xMode); sfx.tap(); }}>✕ 打叉</button>
        <button className="lgp-key" onClick={hint}>💡 提示一格</button>
        <button className="lgp-key" onClick={() => { if (!done) { setState(puzzle.solution.map((r) => r.map(() => 0))); sfx.erase(); } }}>清空</button>
      </div>
      <div className="lgp-status">{picture && !done ? "塗完會拼出什麼圖案呢？" : ""}</div>
      <span className="lgp-verified">{unique ? "✓ 程式已驗算：只有一種塗法" : "⚠ 驗算失敗"}</span>
    </>
  );
}

/* ───────── 一筆畫 ───────── */
export function StrokeBoard({ level: levelProp, howtoOpen, onWin, onOops, onDemo }: BoardProps) {
  const [level] = useState(levelProp);
  const [puzzle] = useState(() => makeStroke(level));
  const ok = useMemo(() => hasEulerPath(puzzle.nodes, puzzle.edges), [puzzle]);
  const [cur, setCur] = useState<number | null>(null);
  const [used, setUsed] = useState<number[]>([]);
  const [hintOn, setHintOn] = useState(false);
  const [msg, setMsg] = useState<{ text: string; err: boolean }>({ text: "", err: false });
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);
  const nodeRefs = useRef<Record<number, SVGCircleElement | null>>({});
  const gap = 100, pad = 40;
  const vw = pad * 2 + gap * (puzzle.width - 1), vh = pad * 2 + gap * (puzzle.height - 1);
  const pos = (n: number) => [pad + (n % puzzle.width) * gap, pad + Math.floor(n / puzzle.width) * gap];

  const reset = () => { setCur(null); setUsed([]); setMsg({ text: "", err: false }); sfx.erase(); };
  const tap = (n: number) => {
    if (done) return;
    if (cur === null) { setCur(n); sfx.tap(); return; }
    const i = puzzle.edges.findIndex(([a, b], k) => !used.includes(k) && ((a === cur && b === n) || (b === cur && a === n)));
    if (i < 0) { shake(nodeRefs.current[n]); onOops(); return; }
    const nextUsed = [...used, i];
    setUsed(nextUsed); setCur(n); sfx.step(nextUsed.length);
    if (nextUsed.length === puzzle.edges.length) {
      setDone(true);
      setTimeout(() => onWin({ title: "一筆畫完成！", text: `${puzzle.edges.length} 條線一次畫完！` }), reducedMotion() ? 0 : 350);
      return;
    }
    if (!puzzle.edges.some(([a, b], k) => !nextUsed.includes(k) && (a === n || b === n))) {
      const f = fails + 1;
      setFails(f); onOops();
      setMsg({ text: f >= 2 ? "卡住了。想想看：起點該選哪種點？按「提示」看看。" : "卡住了，還有線沒畫到。按「重來」再試一次。", err: true });
    }
  };

  return (
    <>
      <div className="lgp-head"><h2>✏️ 一筆畫</h2><span className="lgp-qno">第 {level} 題 · {puzzle.edges.length} 條線</span></div>
      <HowTo game="stroke" open={howtoOpen} onDemo={onDemo} />
      <svg className="lgp-stroke" viewBox={`0 0 ${vw} ${vh}`} role="img" aria-label="一筆畫圖形">
        {puzzle.edges.map(([a, b], k) => {
          const [x1, y1] = pos(a), [x2, y2] = pos(b);
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className={used.includes(k) ? "lgp-edge used" : "lgp-edge"} />;
        })}
        {puzzle.nodes.map((n) => {
          const [cx, cy] = pos(n);
          const cls = `lgp-node${cur === n ? " cur" : ""}${hintOn && puzzle.oddNodes.includes(n) ? " hint" : ""}`;
          return (
            <g key={n}>
              <circle ref={(el) => { nodeRefs.current[n] = el; }} cx={cx} cy={cy} r={15} className={cls} />
              <circle cx={cx} cy={cy} r={34} className="lgp-node-hit" onClick={() => tap(n)} />
            </g>
          );
        })}
      </svg>
      <div className="lgp-keys">
        <button className="lgp-key" onClick={reset}>↺ 重來</button>
        <button className="lgp-key" onClick={() => {
          setHintOn(true); sfx.tap();
          setMsg({ text: puzzle.oddNodes.length ? "紅框的點連著「單數」條線。從其中一個出發，就會在另一個結束。" : "每個點都連著雙數條線，從哪裡出發都可以。", err: false });
        }}>💡 提示</button>
      </div>
      <div className={msg.err ? "lgp-status err" : "lgp-status"}>{msg.text}</div>
      <span className="lgp-verified">{ok ? "✓ 程式已驗算：這張圖一定畫得完" : "⚠ 驗算失敗"}</span>
    </>
  );
}

/* ───────── 4×4 數獨 ───────── */
export function SudokuBoard({ level: levelProp, howtoOpen, onWin, onOops, onDemo }: BoardProps) {
  const [level] = useState(levelProp);
  const [puzzle] = useState(() => makeSudoku(level));
  const unique = useMemo(() => countSolutions(puzzle.givens) === 1, [puzzle]);
  const [state, setState] = useState<number[]>(() => puzzle.givens.slice());
  const [sel, setSel] = useState(() => puzzle.givens.indexOf(0));
  const [done, setDone] = useState(false);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ss = typeof window === "undefined" ? 64 : Math.min(70, Math.floor((Math.min(window.innerWidth, 540) - 90) / 4));

  const set = (i: number, v: number) => {
    if (done || i < 0 || puzzle.givens[i]) return;
    const next = state.slice();
    next[i] = v;
    setState(next);
    if (v && hasConflict(next, i)) { shake(cellRefs.current[i]); onOops(); }
    else (v ? sfx.tap : sfx.erase)();
    if (next.every((x, k) => x === puzzle.solution[k])) {
      setDone(true);
      setTimeout(() => onWin({ title: "全部填對了！", text: "每一列、每一行、每一格都沒有重複！" }), reducedMotion() ? 0 : 300);
    }
  };
  const hint = () => {
    const wrong = state.map((_, i) => i).filter((i) => state[i] !== puzzle.solution[i]);
    if (!wrong.length || done) return;
    const i = wrong[randInt(wrong.length)];
    setSel(i); set(i, puzzle.solution[i]);
  };

  return (
    <>
      <div className="lgp-head"><h2>🔢 數獨</h2><span className="lgp-qno">第 {level} 題 · 提示 {puzzle.givens.filter(Boolean).length} 格</span></div>
      <HowTo game="sudoku" open={howtoOpen} onDemo={onDemo} />
      <div className="lgp-sudoku" style={{ "--ss": `${ss}px` } as React.CSSProperties}>
        {state.map((v, i) => {
          const r = Math.floor(i / 4), c = i % 4, given = !!puzzle.givens[i];
          const cls = `lgp-scell${given ? " given" : ""}${c === 1 ? " c1" : ""}${r === 1 ? " r1" : ""}${i === sel && !done ? " sel" : ""}${!given && hasConflict(state, i) ? " bad" : ""}`;
          return (
            <button key={i} ref={(el) => { cellRefs.current[i] = el; }} className={cls} aria-label={`第 ${r + 1} 列第 ${c + 1} 格`}
              onClick={() => { if (!given && !done) { setSel(i); sfx.tap(); } }}>
              {v || ""}
            </button>
          );
        })}
      </div>
      <div className="lgp-pad">
        {[1, 2, 3, 4].map((v) => <button key={v} className="lgp-key" onClick={() => set(sel, v)}>{v}</button>)}
        <button className="lgp-key erase" onClick={() => set(sel, 0)}>擦掉</button>
      </div>
      <div className="lgp-keys"><button className="lgp-key" onClick={hint}>💡 提示一格</button></div>
      <span className="lgp-verified">{unique ? "✓ 程式已驗算：只有一個解" : "⚠ 驗算失敗"}</span>
    </>
  );
}
