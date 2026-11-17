"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdventureMap } from "@/components/play/adventure-map";
import { NonogramBoard, StrokeBoard, SudokuBoard, type WinInfo } from "@/components/play/boards";
import { DemoOverlay } from "@/components/play/demo";
import { Garden, NEW_VISITOR_STARS, useTimeScale, type GardenEvent } from "@/components/play/garden";
import { PixelPicture } from "@/components/play/pixel-picture";
import { plantById, seedPacketSvg, visitorById, visitorSvg, type VisitorId } from "@/lib/garden/catalog";
import {
  attention, dailyChestReward, ensureStarted, grant, pathChestReward, puzzleReward, STARTER_SEEDS, type SeedReward,
} from "@/lib/garden/logic";
import { BOSS_BONUS_STARS, nodeAt } from "@/lib/puzzles/adventure";
import { canOpenChest, currentStreak, DAILY_GOAL, recordSolve, rollDay } from "@/lib/puzzles/daily";
import { CHEERS, OOPS_LINES, PET_INTRO, PET_STAGES, petSvg, stageOf, type PetMood } from "@/lib/puzzles/pet";
import { PICTURES } from "@/lib/puzzles/pictures";
import { randInt } from "@/lib/puzzles/random";
import { loadSave, writeSave, type GameKind, type PlaySave } from "@/lib/puzzles/save";
import { setMuted, sfx } from "@/lib/puzzles/sound";
import { speak } from "@/lib/puzzles/speech";
import type { Look } from "@/lib/puzzles/wardrobe";

type Tab = "map" | "garden" | GameKind | "dex";
const isGame = (t: Tab): t is GameKind => t === "nono" || t === "stroke" || t === "sudoku";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "map", icon: "🗺️", label: "冒險" },
  { id: "garden", icon: "🌱", label: "花園" },
  { id: "nono", icon: "🧩", label: "練習" },
  { id: "dex", icon: "📖", label: "圖鑑" },
];
const PRACTICE: { id: GameKind; label: string }[] = [
  { id: "nono", label: "🧩 數織" },
  { id: "stroke", label: "✏️ 一筆畫" },
  { id: "sudoku", label: "🔢 數獨" },
];

type Overlay =
  | { kind: "win"; info: WinInfo; evolvedTo?: number; dailyDone: boolean; gain: number; boss: boolean; fromMap: boolean; loot: SeedReward }
  | { kind: "chest"; loot: SeedReward; source: "daily" | "adventure" }
  | { kind: "visitor"; v: VisitorId; evolvedTo?: number }
  | { kind: "gift" }
  | { kind: "evolve"; to: number }
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

/** 獎勵的種子（同種合併顯示） */
function Loot({ loot }: { loot: SeedReward }) {
  const counts = loot.seeds.reduce<Record<string, number>>((m, s) => ({ ...m, [s]: (m[s] ?? 0) + 1 }), {});
  return (
    <div className="lgp-loot">
      {Object.entries(counts).map(([id, n]) => (
        <span key={id}>
          <svg viewBox="0 0 100 100" aria-hidden="true" dangerouslySetInnerHTML={{ __html: seedPacketSvg(id as never) }} />
          {plantById(id as never).name}種子{n > 1 ? ` ×${n}` : ""}
        </span>
      ))}
      {loot.fertilizer > 0 && <span>🧪 肥料 ×{loot.fertilizer}</span>}
    </div>
  );
}

export function PuzzleGame() {
  const [save, setSave] = useState<PlaySave | null>(null);
  const [tab, setTab] = useState<Tab>("map");
  const [playing, setPlaying] = useState<number | null>(null); // 冒險地圖上正在玩的關卡
  const [round, setRound] = useState(0);
  const [mood, setMood] = useState<PetMood>("idle");
  const [bubble, setBubble] = useState(PET_INTRO);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primaryBtn = useRef<HTMLButtonElement>(null);
  const scale = useTimeScale();

  useEffect(() => {
    const s = rollDay(loadSave());
    setMuted(s.muted);
    setSave(s);
    writeSave(s);
    const att = attention(s.garden, Date.now());
    setBubble(att.ready ? `花園裡有 ${att.ready} 株植物可以收成了！` : s.stars ? "今天也一起動腦吧！" : "點地圖上發亮的那一關，我們出發吧！");
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
  const mapNode = tab === "map" && playing !== null ? nodeAt(playing) : null;
  const game: GameKind | null = mapNode?.game ?? (isGame(tab) ? tab : null);
  const streak = currentStreak(save);
  const chestReady = canOpenChest(save);
  const dailyDone = Math.min(save.daily.done, DAILY_GOAL);
  const gAtt = attention(save.garden, Date.now(), scale);

  const update = (s: PlaySave) => { setSave(s); writeSave(s); };

  const handleWin = (w: WinInfo) => {
    if (!game) return;
    const before = stageOf(save.stars);
    const boss = !!mapNode?.boss;
    const gain = 1 + (boss ? BOSS_BONUS_STARS : 0);
    const advanced = mapNode !== null && mapNode.index === save.adv; // 重玩已過的關不會再往前走
    const loot = puzzleReward(boss);
    const base: PlaySave = {
      ...save,
      stars: save.stars + gain,
      solved: { ...save.solved, [game]: save.solved[game] + 1 },
      dex: w.picture && !save.dex.includes(w.picture.name) ? [...save.dex, w.picture.name] : save.dex,
      adv: advanced ? save.adv + 1 : save.adv,
      garden: grant(save.garden, loot),
    };
    const { save: next, justCompleted } = recordSolve(base);
    update(next);
    const after = stageOf(next.stars);
    const evolved = after > before;
    (evolved || boss ? sfx.evolve : sfx.win)();
    fireConfetti();
    react("happy", evolved ? `我長大了！現在是「${PET_STAGES[after].name}」！` : boss ? "我們打倒 BOSS 了！還拿到稀有種子！" : justCompleted ? "今日任務完成！快去開寶箱！" : CHEERS[randInt(CHEERS.length)]);
    setOverlay({ kind: "win", info: boss ? { ...w, title: "打倒 BOSS！" } : w, evolvedTo: evolved ? after : undefined, dailyDone: justCompleted, gain, boss, fromMap: mapNode !== null, loot });
  };
  const handleOops = () => { sfx.wrong(); react("oops", OOPS_LINES[randInt(OOPS_LINES.length)]); };

  const doOpenChest = () => {
    const rolled = rollDay(save);
    if (!canOpenChest(rolled)) return;
    const loot = dailyChestReward();
    update({ ...rolled, daily: { ...rolled.daily, opened: true }, garden: grant(rolled.garden, loot) });
    sfx.evolve();
    fireConfetti();
    react("happy", "寶箱裡有稀有種子！快去花園種種看！");
    setOverlay({ kind: "chest", loot, source: "daily" });
  };

  /** 點地圖上的點 */
  const openNode = (k: number) => {
    const n = nodeAt(k);
    sfx.tap();
    if (n.kind === "chest") {
      if (k !== save.adv) { react("happy", "這個寶箱已經開過了！"); return; }
      const loot = pathChestReward();
      update({ ...save, adv: save.adv + 1, garden: grant(save.garden, loot) });
      sfx.evolve();
      fireConfetti();
      react("happy", "路上撿到寶箱！裡面有種子和肥料！");
      setOverlay({ kind: "chest", loot, source: "adventure" });
      return;
    }
    setPlaying(k);
    setRound((r) => r + 1);
    if (n.game && !save.seenDemo.includes(n.game)) setOverlay({ kind: "demo", game: n.game });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const backToMap = () => { setOverlay(null); setPlaying(null); setTab("map"); setRound((r) => r + 1); };

  const goNext = () => {
    if (playing !== null || (overlay?.kind === "chest" && overlay.source === "adventure")) return backToMap();
    setOverlay(null);
    setRound((r) => r + 1);
  };
  const openGarden = () => {
    setOverlay(null);
    setPlaying(null);
    setTab("garden");
    if (!save.garden.started) {
      update({ ...save, garden: ensureStarted(save.garden) });
      setOverlay({ kind: "gift" });
      sfx.evolve();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const selectTab = (t: Tab) => {
    sfx.tap();
    if (t === "garden") return openGarden();
    setTab(t);
    setPlaying(null);
    setRound((r) => r + 1);
    if (isGame(t) && !save.seenDemo.includes(t)) setOverlay({ kind: "demo", game: t });
  };
  const closeDemo = (g: GameKind) => {
    setOverlay(null);
    if (!save.seenDemo.includes(g)) update({ ...save, seenDemo: [...save.seenDemo, g] });
  };

  const onGarden = (e: GardenEvent) => {
    const before = stageOf(save.stars);
    const stars = save.stars + (e.stars ?? 0);
    update({ ...save, garden: e.garden, stars });
    const after = stageOf(stars);
    const evolved = after > before;
    react(e.mood ?? "happy", evolved ? `我長大了！現在是「${PET_STAGES[after].name}」！` : e.say);
    if (e.newVisitor) {
      sfx.evolve(); fireConfetti();
      setOverlay({ kind: "visitor", v: e.newVisitor, evolvedTo: evolved ? after : undefined });
    } else if (evolved) {
      sfx.evolve(); fireConfetti();
      setOverlay({ kind: "evolve", to: after });
    } else if (e.expanded) {
      fireConfetti();
    }
  };

  const boardProps = game ? {
    level: mapNode ? mapNode.level : save.solved[game] + 1,
    howtoOpen: save.solved[game] < 2,
    onWin: handleWin,
    onOops: handleOops,
    onDemo: () => setOverlay({ kind: "demo", game }),
  } : null;

  const gardenHint = gAtt.ready ? `✨ ${gAtt.ready} 株可收成` : gAtt.thirsty ? `💧 ${gAtt.thirsty} 株口渴` : "去花園看看";

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
          {tab !== "garden" && (
            <button className={gAtt.ready ? "lgp-key go lgp-chest-btn" : "lgp-key"} onClick={() => { sfx.tap(); openGarden(); }}>🌱 {gardenHint}</button>
          )}
        </div>
      </section>

      <nav className="lgp-tabs" role="tablist" aria-label="分頁">
        {TABS.map((t) => {
          const selected = t.id === "nono" ? isGame(tab) : tab === t.id;
          return (
            <button key={t.id} role="tab" aria-selected={selected} className="lgp-tab" onClick={() => selectTab(t.id === "nono" && isGame(tab) ? tab : t.id)}>
              <span className="ic">{t.icon}</span>{t.label}
              {t.id === "garden" && gAtt.ready > 0 && <span className="lgp-tab-dot" aria-label="有植物可以收成" />}
            </button>
          );
        })}
      </nav>

      <section className={(tab === "map" && !mapNode) || tab === "garden" ? "lgp-sheet lgp-chunky lgp-sheet-map" : "lgp-sheet lgp-chunky"}>
        {tab === "map" && !mapNode && (
          <AdventureMap adv={save.adv} stage={stage} stars={save.stars} look={save.look} mood={mood} onOpen={openNode} />
        )}
        {mapNode && boardProps && (
          <>
            <div className="lgp-map-bar">
              <button className="lgp-key" onClick={backToMap}>← 回地圖</button>
              <span className="lgp-qno">第 {mapNode.index + 1} 關{mapNode.boss ? " · 👑 BOSS" : ""}</span>
            </div>
            {mapNode.game === "nono" && (
              <NonogramBoard key={`mn${round}`} {...boardProps} picture={mapNode.boss ? undefined : nextPicture}
                dexIndex={save.dex.length + 1} dexTotal={PICTURES.length} />
            )}
            {mapNode.game === "stroke" && <StrokeBoard key={`ms${round}`} {...boardProps} />}
            {mapNode.game === "sudoku" && <SudokuBoard key={`md${round}`} {...boardProps} />}
          </>
        )}
        {tab === "garden" && (
          <Garden garden={save.garden} petStage={stage} petStars={save.stars} look={save.look} mood={mood} onChange={onGarden}
            onGoMap={() => selectTab("map")} />
        )}
        {isGame(tab) && boardProps && (
          <>
            <div className="lgp-seg" role="tablist" aria-label="練習哪一種">
              {PRACTICE.map((p) => (
                <button key={p.id} role="tab" aria-selected={tab === p.id} onClick={() => selectTab(p.id)}>{p.label}</button>
              ))}
            </div>
            {tab === "nono" && (
              <NonogramBoard key={`n${round}`} {...boardProps} picture={nextPicture}
                dexIndex={save.dex.length + 1} dexTotal={PICTURES.length}
                level={Math.max(1, save.solved.nono - PICTURES.length + 1)} />
            )}
            {tab === "stroke" && <StrokeBoard key={`s${round}`} {...boardProps} />}
            {tab === "sudoku" && <SudokuBoard key={`d${round}`} {...boardProps} />}
          </>
        )}
        {tab === "dex" && (
          <>
            <div className="lgp-head"><h2>📖 拼圖圖鑑</h2><span className="lgp-qno">{save.dex.length} / {PICTURES.length}</span></div>
            <p className="lgp-note">玩數織拼出圖案，就會收進這裡。問號裡面藏著什麼？拼出來才知道！（小動物的圖鑑在花園裡）</p>
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

      {overlay?.kind === "demo" && <DemoOverlay game={overlay.game} onClose={() => closeDemo(overlay.game)} />}

      {overlay?.kind === "win" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="過關">
            <h3>{overlay.evolvedTo !== undefined ? "腦腦長大了！" : overlay.info.title}</h3>
            {overlay.info.picture && <PixelPicture picture={overlay.info.picture} />}
            <p>{overlay.info.text}</p>
            <span className="gain">+{overlay.gain} ⭐{overlay.boss ? "（BOSS 加碼）" : ""}</span>
            <Loot loot={overlay.loot} />
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
                <button ref={primaryBtn} className="lgp-key go" onClick={goNext}>{overlay.fromMap ? "回地圖，繼續前進 →" : "下一題 →"}</button>
              )}
              {overlay.dailyDone && <button className="lgp-key" onClick={goNext}>{overlay.fromMap ? "先回地圖" : "先玩下一題"}</button>}
              {!overlay.dailyDone && <button className="lgp-key" onClick={openGarden}>🌱 去種種子</button>}
            </div>
          </div>
        </div>
      )}

      {overlay?.kind === "chest" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="寶箱">
            <div className="lgp-chest" aria-hidden="true">🎁</div>
            <h3>{overlay.source === "daily" ? "今日寶箱！" : "路上的寶箱！"}</h3>
            <Loot loot={overlay.loot} />
            {overlay.source === "daily"
              ? <p className="lgp-win-daily">🔥 已經連續 {currentStreak(save)} 天，明天再來開新寶箱！</p>
              : <p className="lgp-win-daily">🗺️ 種子可以拿去花園種，肥料能讓植物馬上長大！</p>}
            <div className="lgp-keys">
              <button ref={primaryBtn} className="lgp-key go" onClick={openGarden}>🌱 去花園種</button>
              <button className="lgp-key" onClick={goNext}>{playing !== null || overlay.source === "adventure" ? "回地圖" : "繼續玩"}</button>
            </div>
          </div>
        </div>
      )}

      {overlay?.kind === "gift" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="新手禮物">
            <div className="lgp-chest" aria-hidden="true">🌱</div>
            <h3>歡迎來到花園！</h3>
            <p>這是腦腦的花園。送你一些種子，先種種看吧！</p>
            <Loot loot={{ seeds: Object.entries(STARTER_SEEDS).flatMap(([id, n]) => Array(n).fill(id)), fertilizer: 0 }} />
            <ol className="lgp-steps">
              <li>點一塊<b>空地</b>，選種子種下去</li>
              <li>點<b>💧</b>幫它澆水，它就會開始長大</li>
              <li>植物<b>發亮</b>時點一下就能收成</li>
              <li>成熟的植物會吸引<b>小動物</b>來玩，記得拍照！</li>
            </ol>
            <div className="lgp-keys">
              <button ref={primaryBtn} className="lgp-key go" onClick={() => setOverlay(null)}>開始種！</button>
              <button className="lgp-key" onClick={() => speak("歡迎來到花園！點一塊空地，選種子種下去。點水滴幫它澆水，它就會開始長大。植物發亮的時候點一下就能收成。成熟的植物會吸引小動物來玩，記得拍照！")}>🔊 念給我聽</button>
            </div>
          </div>
        </div>
      )}

      {overlay?.kind === "visitor" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="新朋友">
            <h3>📷 新朋友！</h3>
            <svg viewBox="0 0 100 100" width="140" height="140" aria-hidden="true" dangerouslySetInnerHTML={{ __html: visitorSvg(overlay.v) }} />
            <p style={{ fontSize: "1.3rem" }}>{visitorById(overlay.v).name}</p>
            <p>{visitorById(overlay.v).met}</p>
            <span className="gain">+{NEW_VISITOR_STARS} ⭐</span>
            {overlay.evolvedTo !== undefined && <p className="lgp-win-daily">腦腦也長大了，變成「{PET_STAGES[overlay.evolvedTo].name}」！</p>}
            <div className="lgp-keys"><button ref={primaryBtn} className="lgp-key go" onClick={() => setOverlay(null)}>收進圖鑑</button></div>
          </div>
        </div>
      )}

      {overlay?.kind === "evolve" && (
        <div className="lgp-overlay">
          <div className="lgp-win lgp-chunky" role="dialog" aria-label="腦腦長大了">
            <h3>腦腦長大了！</h3>
            <PetSvg stage={overlay.to} stars={save.stars} mood="happy" look={save.look} size={130} />
            <p>變成「{PET_STAGES[overlay.to].name}」了！</p>
            <div className="lgp-keys"><button ref={primaryBtn} className="lgp-key go" onClick={() => setOverlay(null)}>太棒了！</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
