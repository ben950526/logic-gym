"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { NonogramBoard, StrokeBoard, SudokuBoard, type WinInfo } from "@/components/play/boards";
import { DemoOverlay } from "@/components/play/demo";
import { PixelPicture } from "@/components/play/pixel-picture";
import { canOpenChest, CHEST_BONUS_STARS, currentStreak, DAILY_GOAL, openChest, recordSolve, rollDay } from "@/lib/puzzles/daily";
import { CHEERS, OOPS_LINES, PET_INTRO, PET_STAGES, petSvg, stageOf, type PetMood } from "@/lib/puzzles/pet";
import { PICTURES } from "@/lib/puzzles/pictures";
import { randInt } from "@/lib/puzzles/random";
import { loadSave, writeSave, type GameKind, type PlaySave } from "@/lib/puzzles/save";
import { setMuted, sfx } from "@/lib/puzzles/sound";
import { speak } from "@/lib/puzzles/speech";
import { WARDROBE, type ItemSlot, type Look, type WardrobeItem } from "@/lib/puzzles/wardrobe";

type Tab = GameKind | "dex" | "wardrobe";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "nono", icon: "🧩", label: "數織" },
  { id: "stroke", icon: "✏️", label: "一筆畫" },
  { id: "sudoku", icon: "🔢", label: "數獨" },
  { id: "dex", icon: "📖", label: "圖鑑" },
];

const SLOT_LABEL: Record<ItemSlot, string> = { color: "顏色", hat: "帽子", face: "配件" };

type Overlay =
  | { kind: "win"; info: WinInfo; evolvedTo?: number; dailyDone: boolean }
  | { kind: "chest"; item: WardrobeItem | null }
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

function PetSvg({ stage, stars, mood, look, size = 112 }: { stage: number; stars: number; mood: PetMood; look: Look; size?: number }) {
  return (
    <svg className={`lgp-pet lgp-mood-${mood}`} style={{ width: size, height: size }} viewBox="0 0 120 120" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: petSvg(stage, stars, mood, look) }} />
  );
}

export function PuzzleGame() {
  const [save, setSave] = useState<PlaySave | null>(null);
  const [tab, setTab] = useState<Tab>("nono");
  const [round, setRound] = useState(0);
  const [mood, setMood] = useState<PetMood>("idle");
  const [bubble, setBubble] = useState(PET_INTRO);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primaryBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const s = rollDay(loadSave());
    setMuted(s.muted);
    setSave(s);
    writeSave(s);
    if (s.stars) setBubble("今天也一起動腦吧！");
    if (!s.seenDemo.includes("nono")) setOverlay({ kind: "demo", game: "nono" });
  }, []);
  useEffect(() => { if (overlay && overlay.kind !== "demo") primaryBtn.current?.focus(); }, [overlay]);

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
  const game: GameKind | null = tab === "nono" || tab === "stroke" || tab === "sudoku" ? tab : null;
  const streak = currentStreak(save);
  const chestReady = canOpenChest(save);
  const dailyDone = Math.min(save.daily.done, DAILY_GOAL);

  const update = (s: PlaySave) => { setSave(s); writeSave(s); };

  const handleWin = (w: WinInfo) => {
    if (!game) return;
    const before = stageOf(save.stars);
    const base: PlaySave = {
      ...save,
      stars: save.stars + 1,
      solved: { ...save.solved, [game]: save.solved[game] + 1 },
      dex: w.picture && !save.dex.includes(w.picture.name) ? [...save.dex, w.picture.name] : save.dex,
    };
    const { save: next, justCompleted } = recordSolve(base);
    update(next);
    const after = stageOf(next.stars);
    const evolved = after > before;
    (evolved ? sfx.evolve : sfx.win)();
    fireConfetti();
    react("happy", evolved ? `我長大了！現在是「${PET_STAGES[after].name}」！` : justCompleted ? "今日任務完成！快去開寶箱！" : CHEERS[randInt(CHEERS.length)]);
    setOverlay({ kind: "win", info: w, evolvedTo: evolved ? after : undefined, dailyDone: justCompleted });
  };
  const handleOops = () => { sfx.wrong(); react("oops", OOPS_LINES[randInt(OOPS_LINES.length)]); };

  const doOpenChest = () => {
    const rolled = rollDay(save);
    if (!canOpenChest(rolled)) return;
    const { save: next, item } = openChest(rolled);
    update(next);
    sfx.evolve();
    fireConfetti();
    react("happy", item ? `哇！我拿到「${item.name}」了！` : `寶箱裡有 ${CHEST_BONUS_STARS} 顆星星！`);
    setOverlay({ kind: "chest", item });
  };

  const goNext = () => { setOverlay(null); setRound((r) => r + 1); };
  const selectTab = (t: Tab) => {
    sfx.tap();
    setTab(t);
    setRound((r) => r + 1);
    if ((t === "nono" || t === "stroke" || t === "sudoku") && !save.seenDemo.includes(t)) setOverlay({ kind: "demo", game: t });
  };
  const closeDemo = (g: GameKind) => {
    setOverlay(null);
    if (!save.seenDemo.includes(g)) update({ ...save, seenDemo: [...save.seenDemo, g] });
  };

  const boardProps = game ? {
    level: save.solved[game] + 1,
    howtoOpen: save.solved[game] < 2,
    onWin: handleWin,
    onOops: handleOops,
    onDemo: () => setOverlay({ kind: "demo", game }),
  } : null;

  const equip = (item: WardrobeItem) => {
    const look = { ...save.look, [item.slot]: save.look[item.slot] === item.id ? undefined : item.id };
    sfx.tap();
    update({ ...save, look });
    react("happy", save.look[item.slot] === item.id ? "脫下來了～" : `穿上「${item.name}」，好看嗎？`);
  };

  return (
    <div className="lgp-wrap">
      <section className="lgp-home lgp-chunky" aria-label="腦腦的小窩">
        <button className="lgp-pet-btn" aria-label="摸摸腦腦" onClick={() => { sfx.tap(); react("happy", stage === 0 ? "（蛋輕輕晃了一下⋯⋯）" : CHEERS[randInt(CHEERS.length)]); }}>
          <PetSvg stage={stage} stars={save.stars} mood={mood} look={save.look} />
        </button>
        <div className="lgp-pet-info">
          <p className="lgp-pet-name">{info.name}</p>
          <span className="lgp-pet-stage">{info.label}</span>
          <div className="lgp-bubble" aria-live="polite">
            {bubble}
            <button className="lgp-say" aria-label="念出來" onClick={() => speak(bubble)}>🔊</button>
          </div>
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

      <section className="lgp-daily lgp-chunky" aria-label="今日任務">
        <div className="lgp-daily-main">
          <span className="lgp-daily-title">📅 今日任務：解 {DAILY_GOAL} 題</span>
          <span className="lgp-pips" aria-label={`已完成 ${dailyDone} 題`}>
            {Array.from({ length: DAILY_GOAL }, (_, k) => <i key={k} className={k < dailyDone ? "on" : ""} />)}
          </span>
          <span className={streak ? "lgp-streak on" : "lgp-streak"}>🔥 連續 {streak} 天</span>
        </div>
        <div className="lgp-daily-actions">
          {chestReady ? (
            <button className="lgp-key go lgp-chest-btn" onClick={doOpenChest}>🎁 開寶箱！</button>
          ) : (
            <span className="lgp-chest-wait">{save.daily.opened ? "✅ 今天的寶箱開過了，明天再來！" : `🎁 再解 ${DAILY_GOAL - dailyDone} 題就能開寶箱`}</span>
          )}
          <button className="lgp-key" onClick={() => selectTab("wardrobe")}>👕 換裝 {save.items.length}/{WARDROBE.length}</button>
        </div>
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
        {tab === "wardrobe" && (
          <>
            <div className="lgp-head"><h2>👕 腦腦的衣櫃</h2><span className="lgp-qno">{save.items.length} / {WARDROBE.length}</span></div>
            <PetSvg stage={Math.max(1, stage)} stars={save.stars} mood="idle" look={save.look} size={130} />
            <p className="lgp-note">{stage === 0 ? "腦腦還在蛋裡，孵出來之後就能穿上這些衣服喔！" : "點一下就能穿上，再點一次脫下來。每天完成任務開寶箱，就能拿到新衣服！"}</p>
            {(["color", "hat", "face"] as ItemSlot[]).map((slot) => (
              <div key={slot} className="lgp-closet">
                <span className="lgp-closet-label">{SLOT_LABEL[slot]}</span>
                <div className="lgp-closet-row">
                  {WARDROBE.filter((w) => w.slot === slot).map((w) => {
                    const owned = save.items.includes(w.id);
                    const on = save.look[slot] === w.id;
                    return (
                      <button key={w.id} className={`lgp-item${on ? " on" : ""}`} disabled={!owned || stage === 0} onClick={() => equip(w)} aria-pressed={on}>
                        {owned ? (
                          <PetSvg stage={1} stars={3} mood="idle" look={{ [slot]: w.id }} size={52} />
                        ) : <span className="lgp-dex-q" style={{ width: 52, height: 52, fontSize: "1.4rem" }}>?</span>}
                        <span>{owned ? w.name : "？？"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <footer className="lgp-footer">
        每一題都由程式產生，並驗算過答案只有一個 · 進度先存在這台裝置
        <br />
        <Link href="/pricing">家長專區</Link>
      </footer>

      {overlay?.kind === "demo" && <DemoOverlay game={overlay.game} onClose={() => closeDemo(overlay.game)} />}

      {overlay?.kind === "win" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="過關">
            <h3>{overlay.evolvedTo !== undefined ? "腦腦長大了！" : overlay.info.title}</h3>
            {overlay.info.picture && <PixelPicture picture={overlay.info.picture} />}
            <p>{overlay.info.text}</p>
            <span className="gain">+1 ⭐</span>
            {overlay.evolvedTo !== undefined && (
              <>
                <PetSvg stage={overlay.evolvedTo} stars={save.stars} mood="happy" look={save.look} size={110} />
                <p>變成「{PET_STAGES[overlay.evolvedTo].name}」了！</p>
              </>
            )}
            {overlay.dailyDone && <p className="lgp-win-daily">📅 今日任務完成！🎁 寶箱可以開了！</p>}
            <div className="lgp-keys">
              {overlay.dailyDone ? (
                <button ref={primaryBtn} className="lgp-key go" onClick={doOpenChest}>🎁 開寶箱</button>
              ) : (
                <button ref={primaryBtn} className="lgp-key go" onClick={goNext}>下一題 →</button>
              )}
              {overlay.dailyDone && <button className="lgp-key" onClick={goNext}>先玩下一題</button>}
              {overlay.info.picture && !overlay.dailyDone && <button className="lgp-key" onClick={() => { setOverlay(null); setTab("dex"); }}>看圖鑑</button>}
            </div>
          </div>
        </div>
      )}

      {overlay?.kind === "chest" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="寶箱">
            <div className="lgp-chest" aria-hidden="true">🎁</div>
            <h3>{overlay.item ? `拿到「${overlay.item.name}」！` : `${CHEST_BONUS_STARS} 顆星星！`}</h3>
            {overlay.item ? (
              <>
                <PetSvg stage={Math.max(1, stage)} stars={save.stars} mood="happy" look={save.look} size={120} />
                <p>{stage === 0 ? "腦腦孵出來之後就能穿上囉！" : "已經幫腦腦穿上了，去衣櫃可以換。"}</p>
              </>
            ) : <p>衣服都收集齊了，寶箱改送星星！</p>}
            <p className="lgp-win-daily">🔥 已經連續 {currentStreak(save)} 天，明天再來開新寶箱！</p>
            <div className="lgp-keys">
              <button ref={primaryBtn} className="lgp-key go" onClick={goNext}>繼續玩 →</button>
              {overlay.item && <button className="lgp-key" onClick={() => { setOverlay(null); setTab("wardrobe"); }}>去衣櫃</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
