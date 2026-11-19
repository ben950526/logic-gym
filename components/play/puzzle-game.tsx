"use client";

import { useEffect, useRef, useState } from "react";
import { AdventureMap } from "@/components/play/adventure-map";
import { NonogramBoard, StrokeBoard, SudokuBoard, type WinInfo } from "@/components/play/boards";
import { DemoOverlay } from "@/components/play/demo";
import { ParentZone } from "@/components/play/parent-zone";
import { PixelPicture } from "@/components/play/pixel-picture";
import { nodeAt } from "@/lib/puzzles/adventure";
import { PICTURES } from "@/lib/puzzles/pictures";
import { randInt } from "@/lib/puzzles/random";
import { loadSave, recordSolve, writeSave, type GameKind, type PlaySave } from "@/lib/puzzles/save";
import { setMuted, sfx } from "@/lib/puzzles/sound";
import { speak } from "@/lib/puzzles/speech";
import {
  BOSS_DROPS, growthNote, nextTreeStage, stageProgress, TREE_STAGES, treeStageOf, treeSvg, treeViewBox,
} from "@/lib/puzzles/tree";

type Tab = "tree" | "map";
const GAME_NAME: Record<GameKind, string> = { nono: "數織", stroke: "一筆畫", sudoku: "數獨" };
const INTRO = "這是你的種子。每解開一題，它就會喝到一滴水，慢慢長成大樹！";

type Overlay =
  | { kind: "win"; info: WinInfo; gain: number; drops: number; grewTo?: number; boss: boolean }
  | { kind: "demo"; game: GameKind }
  | null;

function fireConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.className = "lgp-confetti";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) return cv.remove();
  const dpr = window.devicePixelRatio || 1;
  cv.width = window.innerWidth * dpr;
  cv.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const cols = ["#ff5d73", "#ffc93c", "#5fd3a8", "#7c5cff", "#4d9fff"];
  const ps = Array.from({ length: 90 }, () => ({
    x: window.innerWidth / 2, y: window.innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
    r: Math.random() * 6 + 4, c: cols[randInt(5)], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4,
  }));
  let t = 0;
  const frame = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of ps) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += p.va;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
    }
    if (++t < 90) requestAnimationFrame(frame);
    else cv.remove();
  };
  requestAnimationFrame(frame);
}

/** 天空跟著真實時間變 */
function skyNow(): "morning" | "day" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return "morning";
  if (h >= 9 && h < 17) return "day";
  if (h >= 17 && h < 19) return "evening";
  return "night";
}

function TreeArt({ drops, newest = false, className = "" }: { drops: number; newest?: boolean; className?: string }) {
  return (
    <svg className={`lgp-tree ${className}`} viewBox={treeViewBox(drops)} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: treeSvg(drops, newest) }} />
  );
}

/** 離下一個階段還要幾題 */
function nextLine(drops: number): string {
  const nxt = nextTreeStage(drops);
  if (!nxt) return "你的樹已經完全長大了！繼續冒險，讓它一直開心下去！";
  const left = nxt.at - drops;
  return `再解 ${left} 題，就會變成「${nxt.name}」！`;
}

export function PuzzleGame() {
  const [save, setSave] = useState<PlaySave | null>(null);
  const [tab, setTab] = useState<Tab>("tree");
  const [playing, setPlaying] = useState<number | null>(null); // 正在玩冒險地圖上的第幾關
  const [round, setRound] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [rustle, setRustle] = useState(0);
  const [sky, setSky] = useState<ReturnType<typeof skyNow>>("day");
  const [parentOpen, setParentOpen] = useState(false);
  const primaryBtn = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<PlaySave | null>(null); // 最新的存檔（延遲觸發的過關、提示不會拿到舊的）
  saveRef.current = save;
  const hintedRef = useRef(false); // 這一題按過提示了沒（每題最多算一次）

  useEffect(() => {
    const s = loadSave();
    setMuted(s.muted);
    setSave(s);
    writeSave(s);
    setSky(skyNow());
  }, []);
  useEffect(() => { if (overlay?.kind === "win") primaryBtn.current?.focus(); }, [overlay]);

  if (!save) return <div className="lgp-wrap" aria-busy="true" />;

  const drops = save.stars;
  const stage = TREE_STAGES[treeStageOf(drops)];
  const node = playing !== null ? nodeAt(playing) : null;
  const nextPicture = PICTURES.find((p) => !save.dex.includes(p.name));
  const upNext = nodeAt(save.adv);

  const update = (s: PlaySave) => { saveRef.current = s; setSave(s); writeSave(s); };

  const openNode = (k: number) => {
    const n = nodeAt(k);
    sfx.tap();
    setOverlay(null);
    setTab("map");
    setPlaying(k);
    setRound((r) => r + 1);
    hintedRef.current = false;
    if (!save.seenDemo.includes(n.game)) setOverlay({ kind: "demo", game: n.game });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWin = (w: WinInfo) => {
    const save = saveRef.current;
    if (!node || !save) return;
    const drops = save.stars;
    const gain = node.boss && node.index === save.adv ? BOSS_DROPS : 1; // BOSS 加碼只算第一次
    const before = treeStageOf(drops);
    const next: PlaySave = {
      ...save,
      stars: drops + gain,
      ...recordSolve(save, node.game),
      dex: w.picture && !save.dex.includes(w.picture.name) ? [...save.dex, w.picture.name] : save.dex,
      adv: node.index === save.adv ? save.adv + 1 : save.adv, // 重玩已過的關不會再往前走
    };
    update(next);
    const after = treeStageOf(next.stars);
    const grew = after > before;
    (grew || node.boss ? sfx.evolve : sfx.win)();
    fireConfetti();
    setOverlay({
      kind: "win",
      info: node.boss ? { ...w, title: "打倒 BOSS！" } : w,
      gain,
      drops: next.stars,
      grewTo: grew ? after : undefined,
      boss: node.boss,
    });
  };

  const toTree = () => {
    sfx.tap();
    setOverlay(null);
    setPlaying(null);
    setTab("tree");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toMap = () => {
    sfx.tap();
    setOverlay(null);
    setPlaying(null);
    setTab("map");
    setRound((r) => r + 1);
  };
  const closeDemo = (g: GameKind) => {
    setOverlay(null);
    if (!save.seenDemo.includes(g)) update({ ...save, seenDemo: [...save.seenDemo, g] });
  };

  const boardProps = node ? {
    level: node.level,
    onWin: handleWin,
    onOops: () => sfx.wrong(),
    onDemo: () => setOverlay({ kind: "demo", game: node.game }),
    onHint: () => {
      if (hintedRef.current) return;
      hintedRef.current = true;
      const s = saveRef.current!;
      update({ ...s, hints: { ...s.hints, [node.game]: s.hints[node.game] + 1 } }); },
  } : null;

  const winSay = overlay?.kind === "win"
    ? `${overlay.info.title}${overlay.grewTo !== undefined ? TREE_STAGES[overlay.grewTo].say : growthNote(overlay.drops)}`
    : "";

  return (
    <div className="lgp-wrap">
      <header className="lgp-top lgp-chunky">
        <button className="lgp-top-tree" aria-label="看我的樹" onClick={toTree}>
          <TreeArt drops={drops} />
        </button>
        <div className="lgp-top-info">
          <strong>{stage.name}</strong>
          <span>💧 {drops} 滴水</span>
        </div>
        <button className="lgp-mute" aria-label="音效開關" onClick={() => {
          const muted = !save.muted; setMuted(muted); update({ ...save, muted }); if (!muted) sfx.tap();
        }}>{save.muted ? "🔇" : "🔊"}</button>
      </header>

      <nav className="lgp-tabs" role="tablist" aria-label="分頁">
        <button role="tab" aria-selected={tab === "tree"} className="lgp-tab" onClick={toTree}><span className="ic">🌳</span>我的樹</button>
        <button role="tab" aria-selected={tab === "map"} className="lgp-tab" onClick={toMap}><span className="ic">🗺️</span>冒險</button>
      </nav>

      {tab === "tree" && (
        <section className="lgp-sheet lgp-chunky lgp-sheet-tree" aria-label="我的樹">
          <button className={`lgp-t-scene sky-${sky}`} aria-label="摸摸我的樹"
            onClick={() => { sfx.tap(); setRustle((r) => r + 1); }}>
            {sky === "night" && <span className="lgp-t-stars" aria-hidden="true" />}
            <span className="lgp-t-sun" aria-hidden="true" />
            <TreeArt key={rustle} drops={drops} className={rustle ? "rustle" : ""} />
          </button>
          <div className="lgp-t-card">
            <div className="lgp-head">
              <h2>{stage.name}</h2>
              <span className="lgp-qno">💧 {drops}</span>
            </div>
            <div className="lgp-meter">
              <div className="lgp-bar"><i style={{ width: `${stageProgress(drops) * 100}%` }} /></div>
            </div>
            <p className="lgp-t-next">
              {drops === 0 ? INTRO : nextLine(drops)}
              <button className="lgp-say-inline" aria-label="念出來" onClick={() => speak(drops === 0 ? INTRO : nextLine(drops))}>🔊</button>
            </p>
            <button className="lgp-key go lgp-t-go" onClick={() => openNode(save.adv)}>
              ▶ 第 {save.adv + 1} 關：{upNext.boss ? "👑 BOSS " : ""}{GAME_NAME[upNext.game]}
            </button>
          </div>
          <div className="lgp-t-diary">
            <h3>🌱 成長日記</h3>
            <ol>
              {TREE_STAGES.map((st) => {
                const got = drops >= st.at;
                return (
                  <li key={st.at} className={got ? "got" : ""}>
                    <span className="mark">{got ? "✓" : "🔒"}</span>
                    <span className="nm">{st.name}</span>
                    <span className="at">💧 {st.at}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {tab === "map" && (
        <section className={node ? "lgp-sheet lgp-chunky" : "lgp-sheet lgp-chunky lgp-sheet-map"}>
          {!node && <AdventureMap adv={save.adv} onOpen={openNode} />}
          {node && boardProps && (
            <>
              <div className="lgp-map-bar">
                <button className="lgp-key" onClick={toMap}>← 回地圖</button>
                <span className="lgp-qno">第 {node.index + 1} 關{node.boss ? " · 👑 BOSS" : ""}</span>
              </div>
              {node.game === "nono" && (
                <NonogramBoard key={`n${round}`} {...boardProps} picture={nextPicture} />
              )}
              {node.game === "stroke" && <StrokeBoard key={`s${round}`} {...boardProps} />}
              {node.game === "sudoku" && <SudokuBoard key={`d${round}`} {...boardProps} />}
            </>
          )}
        </section>
      )}

      <footer className="lgp-footer">
        <button className="lgp-key lgp-parent-btn" onClick={() => { sfx.tap(); setParentOpen(true); }}>👨‍👩‍👧 家長專區</button>
        <span>每一題都由程式產生，並驗算過答案只有一個 · 進度存在這台裝置</span>
      </footer>

      {parentOpen && (
        <ParentZone save={save} onMerge={(s) => { setMuted(s.muted); update(s); }} onClose={() => setParentOpen(false)} />
      )}

      {overlay?.kind === "demo" && <DemoOverlay game={overlay.game} onClose={() => closeDemo(overlay.game)} />}

      {overlay?.kind === "win" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="過關">
            <h3>{overlay.info.title}</h3>
            {overlay.info.picture && <PixelPicture picture={overlay.info.picture} />}
            <div className="lgp-win-tree">
              <TreeArt drops={overlay.drops} newest />
              <span className="lgp-drop" aria-hidden="true">💧</span>
            </div>
            <span className="gain">+{overlay.gain} 💧{overlay.boss ? "（BOSS 加碼）" : ""}</span>
            {overlay.grewTo !== undefined ? (
              <p className="lgp-win-grew">🌳 {TREE_STAGES[overlay.grewTo].say}</p>
            ) : (
              <p>{growthNote(overlay.drops)}</p>
            )}
            <p className="lgp-t-next">{nextLine(overlay.drops)}</p>
            <div className="lgp-keys">
              <button ref={primaryBtn} className="lgp-key go" onClick={() => openNode(save.adv)}>下一關 →</button>
              <button className="lgp-key" onClick={toTree}>🌳 看我的樹</button>
              <button className="lgp-key" aria-label="念出來" onClick={() => speak(winSay)}>🔊</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
