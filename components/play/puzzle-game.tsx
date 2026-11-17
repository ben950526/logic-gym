"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { NonogramBoard, StrokeBoard, SudokuBoard, type WinInfo } from "@/components/play/boards";
import { PixelPicture } from "@/components/play/pixel-picture";
import { CHEERS, OOPS_LINES, PET_INTRO, PET_STAGES, petSvg, stageOf, type PetMood } from "@/lib/puzzles/pet";
import { PICTURES } from "@/lib/puzzles/pictures";
import { randInt } from "@/lib/puzzles/random";
import { loadSave, writeSave, type GameKind, type PlaySave } from "@/lib/puzzles/save";
import { setMuted, sfx } from "@/lib/puzzles/sound";

type Tab = GameKind | "dex";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "nono", icon: "🧩", label: "數織" },
  { id: "stroke", icon: "✏️", label: "一筆畫" },
  { id: "sudoku", icon: "🔢", label: "數獨" },
  { id: "dex", icon: "📖", label: "圖鑑" },
];

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

function PetSvg({ stage, stars, mood, size = 112 }: { stage: number; stars: number; mood: PetMood; size?: number }) {
  return (
    <svg className={`lgp-pet lgp-mood-${mood}`} style={{ width: size, height: size }} viewBox="0 0 120 120" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: petSvg(stage, stars, mood) }} />
  );
}

export function PuzzleGame() {
  const [save, setSave] = useState<PlaySave | null>(null);
  const [tab, setTab] = useState<Tab>("nono");
  const [round, setRound] = useState(0);
  const [mood, setMood] = useState<PetMood>("idle");
  const [bubble, setBubble] = useState(PET_INTRO);
  const [win, setWin] = useState<(WinInfo & { evolvedTo?: number }) | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const s = loadSave();
    setMuted(s.muted);
    setSave(s);
    if (s.stars) setBubble("今天也一起動腦吧！");
  }, []);
  useEffect(() => { if (win) nextBtn.current?.focus(); }, [win]);

  const react = useCallback((m: PetMood, say?: string) => {
    setMood(m);
    if (say) setBubble(say);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    if (m !== "idle") moodTimer.current = setTimeout(() => setMood("idle"), 1400);
  }, []);

  if (!save) return <div className="lgp-wrap" aria-busy="true" />;

  const stage = stageOf(save.stars);
  const info = PET_STAGES[stage];
  const nextStage = PET_STAGES[stage + 1];
  const pct = nextStage ? ((save.stars - info.at) / (nextStage.at - info.at)) * 100 : 100;
  const nextPicture = PICTURES.find((p) => !save.dex.includes(p.name));
  const game: GameKind | null = tab === "dex" ? null : tab;

  const update = (s: PlaySave) => { setSave(s); writeSave(s); };

  const handleWin = (w: WinInfo) => {
    if (!game) return;
    const before = stageOf(save.stars);
    const next: PlaySave = {
      ...save,
      stars: save.stars + 1,
      solved: { ...save.solved, [game]: save.solved[game] + 1 },
      dex: w.picture && !save.dex.includes(w.picture.name) ? [...save.dex, w.picture.name] : save.dex,
    };
    update(next);
    const after = stageOf(next.stars);
    const evolved = after > before;
    (evolved ? sfx.evolve : sfx.win)();
    fireConfetti();
    react("happy", evolved ? `我長大了！現在是「${PET_STAGES[after].name}」！` : CHEERS[randInt(CHEERS.length)]);
    setWin({ ...w, evolvedTo: evolved ? after : undefined });
  };
  const handleOops = () => { sfx.wrong(); react("oops", OOPS_LINES[randInt(OOPS_LINES.length)]); };

  const goNext = () => { setWin(null); setRound((r) => r + 1); };
  const selectTab = (t: Tab) => { sfx.tap(); setTab(t); setRound((r) => r + 1); };

  const boardProps = game ? {
    level: save.solved[game] + 1,
    howtoOpen: save.solved[game] < 2,
    onWin: handleWin,
    onOops: handleOops,
  } : null;

  return (
    <div className="lgp-wrap">
      <section className="lgp-home lgp-chunky" aria-label="腦腦的小窩">
        <PetSvg stage={stage} stars={save.stars} mood={mood} />
        <div className="lgp-pet-info">
          <p className="lgp-pet-name">{info.name}</p>
          <span className="lgp-pet-stage">{info.label}</span>
          <div className="lgp-bubble" aria-live="polite">{bubble}</div>
          <div className="lgp-meter">
            <span>⭐ {save.stars}</span>
            <div className="lgp-bar"><i style={{ width: `${pct}%` }} /></div>
            <span>{nextStage ? `${save.stars}/${nextStage.at}` : "MAX"}</span>
          </div>
        </div>
        <button className="lgp-mute" aria-label="音效開關" onClick={() => {
          const muted = !save.muted; setMuted(muted); update({ ...save, muted }); if (!muted) sfx.tap();
        }}>{save.muted ? "🔇" : "🔊"}</button>
      </section>

      <nav className="lgp-tabs" role="tablist" aria-label="謎題種類">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className="lgp-tab" onClick={() => selectTab(t.id)}>
            <span className="ic">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <section className="lgp-sheet lgp-chunky">
        {tab === "nono" && boardProps && (
          <NonogramBoard key={`n${round}`} {...boardProps} picture={nextPicture}
            dexIndex={save.dex.length + 1} dexTotal={PICTURES.length}
            level={Math.max(1, save.solved.nono - PICTURES.length + 1)} />
        )}
        {tab === "stroke" && boardProps && <StrokeBoard key={`s${round}`} {...boardProps} />}
        {tab === "sudoku" && boardProps && <SudokuBoard key={`d${round}`} {...boardProps} />}
        {tab === "dex" && (
          <>
            <div className="lgp-head"><h2>📖 圖鑑</h2><span className="lgp-qno">{save.dex.length} / {PICTURES.length}</span></div>
            <p className="lgp-note">玩數織拼出圖案，就會收進這裡。問號裡面藏著什麼？拼出來才知道！</p>
            <div className="lgp-dex">
              {PICTURES.map((p) => {
                const got = save.dex.includes(p.name);
                return (
                  <div key={p.name} className={got ? "lgp-dex-card" : "lgp-dex-card locked"}>
                    {got ? <PixelPicture picture={p} /> : <div className="lgp-dex-q">?</div>}
                    <span>{got ? p.name : `${p.rows.length}×${p.rows.length}`}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <footer className="lgp-footer">
        每一題都由程式產生，並驗算過答案只有一個 · 進度先存在這台裝置
        <br />
        <Link href="/pricing">家長專區</Link>
      </footer>

      {win && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="過關">
            <h3>{win.evolvedTo !== undefined ? "腦腦長大了！" : win.title}</h3>
            {win.picture && <PixelPicture picture={win.picture} />}
            <p>{win.text}</p>
            <span className="gain">+1 ⭐</span>
            {win.evolvedTo !== undefined && (
              <>
                <PetSvg stage={win.evolvedTo} stars={save.stars} mood="happy" size={110} />
                <p>變成「{PET_STAGES[win.evolvedTo].name}」了！</p>
              </>
            )}
            <div className="lgp-keys">
              <button ref={nextBtn} className="lgp-key go" onClick={goNext}>下一題 →</button>
              {win.picture && <button className="lgp-key" onClick={() => { setWin(null); setTab("dex"); }}>看圖鑑</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
