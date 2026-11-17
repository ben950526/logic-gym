"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fruitSvg, plantById, PLANTS, plantSvg, seedPacketSvg, visitorById, VISITORS, visitorSvg, type PlantId, type VisitorId,
} from "@/lib/garden/catalog";
import {
  attention, feed, feedStars, fertilize, friendlyTime, growSentence, harvest, nextExpansion, photograph, placeOnPlate, plant, plateActive,
  plotStatus, visitorsPresent, water, type GardenState,
} from "@/lib/garden/logic";
import { petSvg, type PetMood } from "@/lib/puzzles/pet";
import { sfx, tone } from "@/lib/puzzles/sound";
import type { Look } from "@/lib/puzzles/wardrobe";

export const NEW_VISITOR_STARS = 2;

/** 測試模式：網址加 ?fast=1，時間快 600 倍 */
export function useTimeScale(): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("fast");
      if (q === "1") sessionStorage.setItem("lg-fast", "1");
      if (q === "0") sessionStorage.removeItem("lg-fast");
      setScale(sessionStorage.getItem("lg-fast") === "1" ? 600 : 1);
    } catch { /* 無痕模式也能玩，只是不能快轉 */ }
  }, []);
  return scale;
}

function useNow(scale: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), scale > 1 ? 500 : 20_000);
    return () => clearInterval(t);
  }, [scale]);
  return now;
}

function skyFor(hour: number): { cls: string; label: string } {
  if (hour >= 6 && hour < 9) return { cls: "morning", label: "早安" };
  if (hour >= 9 && hour < 16) return { cls: "day", label: "白天" };
  if (hour >= 16 && hour < 19) return { cls: "evening", label: "傍晚" };
  return { cls: "night", label: "晚上" };
}

const FLYERS: VisitorId[] = ["butterfly", "bird"];
const AIR_SLOTS = [[22, 14], [74, 12]];
const GROUND_SLOTS = [[6, 46], [92, 50], [36, 93], [62, 93], [6, 66], [92, 70]];

type Sel = { kind: "plot"; i: number } | { kind: "pet" } | { kind: "plate" } | null;

export interface GardenEvent {
  garden: GardenState;
  stars?: number; // 要加給腦腦的星星
  say?: string; // 腦腦要說的話
  mood?: PetMood;
  newVisitor?: VisitorId;
  expanded?: boolean;
}

interface Props {
  garden: GardenState;
  petStage: number;
  petStars: number;
  look: Look;
  mood: PetMood;
  onChange: (e: GardenEvent) => void;
  onGoMap: () => void;
}

const Svg = ({ html, className, label }: { html: string; className?: string; label?: string }) => (
  <svg viewBox="0 0 100 100" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    dangerouslySetInnerHTML={{ __html: html }} />
);

export function Garden({ garden, petStage, petStars, look, mood, onChange, onGoMap }: Props) {
  const scale = useTimeScale();
  const now = useNow(scale);
  const [sel, setSel] = useState<Sel>(null);
  const [fx, setFx] = useState<{ key: number; kind: "water" | "harvest" | "plant" | "photo"; plot?: number; fruit?: PlantId } | null>(null);
  const sky = skyFor(new Date(now).getHours());
  const statuses = useMemo(() => garden.plots.map((p) => plotStatus(p, now, scale)), [garden.plots, now, scale]);
  const present = useMemo(() => visitorsPresent(garden, now, scale), [garden, now, scale]);
  const att = attention(garden, now, scale);
  const cols = garden.plots.length <= 4 ? 2 : 3;
  const seedList = PLANTS.filter((p) => (garden.seeds[p.id] ?? 0) > 0);
  const fruitList = PLANTS.filter((p) => (garden.basket[p.id] ?? 0) > 0);
  const expansion = nextExpansion(garden.harvests);
  const plateOn = plateActive(garden, now, scale) ? garden.plate : null;

  const play = (kind: NonNullable<typeof fx>["kind"], extra: Partial<NonNullable<typeof fx>> = {}) => setFx({ key: Date.now(), kind, ...extra });

  // 訪客位置：會飛的在天上，其他在地上
  const placed = useMemo(() => {
    let a = 0, g = 0;
    return present.map((v) => {
      const flying = FLYERS.includes(v);
      const slot = flying && a < AIR_SLOTS.length ? AIR_SLOTS[a++] : GROUND_SLOTS[g++ % GROUND_SLOTS.length];
      return { v, x: slot[0], y: slot[1], flying };
    });
  }, [present]);

  const doPlant = (i: number, id: PlantId) => {
    const g = plant(garden, i, id, now);
    if (g === garden) return;
    sfx.tap(); play("plant", { plot: i });
    onChange({ garden: g, say: `種下了${plantById(id).name}！記得幫它澆水喔。`, mood: "happy" });
  };
  const doWater = (i: number) => {
    const g = water(garden, i, now);
    if (g === garden) return;
    [880, 990, 1100].forEach((f, k) => tone(f, 0.08, "sine", 0.06, k * 0.06));
    play("water", { plot: i });
    const p = plantById(garden.plots[i].plant!);
    onChange({ garden: g, say: `${p.name}喝飽水了！${growSentence(p.hours * 3600_000 / scale)}`, mood: "happy" });
    setSel(null);
  };
  const doFertilize = (i: number) => {
    const g = fertilize(garden, i, now, scale);
    if (g === garden) return;
    sfx.evolve(); play("water", { plot: i });
    onChange({ garden: g, say: "哇！一下子就長大了！", mood: "happy" });
  };
  const doHarvest = (i: number) => {
    const r = harvest(garden, i, now, scale);
    if (!r.fruit) return;
    sfx.win(); play("harvest", { plot: i, fruit: r.fruit });
    onChange({
      garden: r.garden,
      say: r.expanded ? `花園變大了！現在有 ${r.garden.plots.length} 塊土地！` : `收成了${plantById(r.fruit).fruitName}！可以餵我，也可以放在點心盤。`,
      mood: "happy",
      expanded: r.expanded,
    });
    setSel(null);
  };
  const doFeed = (id: PlantId) => {
    const r = feed(garden, id);
    if (!r.stars) return;
    [523, 784].forEach((f, k) => tone(f, 0.12, "triangle", 0.12, k * 0.1));
    onChange({ garden: r.garden, stars: r.stars, say: `好好吃！謝謝你的${plantById(id).fruitName}！（+${r.stars} ⭐）`, mood: "happy" });
  };
  const doPlate = (id: PlantId) => {
    const g = placeOnPlate(garden, id, now, scale);
    if (g === garden) return;
    sfx.tap();
    onChange({ garden: g, say: `把${plantById(id).fruitName}放在點心盤上了，看看誰會來？`, mood: "happy" });
    setSel(null);
  };
  const doPhoto = (v: VisitorId) => {
    // 快門聲
    tone(1800, 0.03, "square", 0.05); tone(1200, 0.05, "square", 0.05, 0.05);
    play("photo");
    const r = photograph(garden, v);
    if (r.isNew) {
      onChange({ garden: r.garden, stars: NEW_VISITOR_STARS, newVisitor: v, say: `新朋友！是${visitorById(v).name}！`, mood: "happy" });
    } else {
      onChange({ garden, say: `${visitorById(v).name}又來玩了！`, mood: "happy" });
    }
  };

  const tip = att.ready
    ? `✨ 有 ${att.ready} 株可以收成了！點一下發亮的植物。`
    : att.thirsty
      ? `💧 有 ${att.thirsty} 株口渴了，點一下幫它澆水。`
      : att.emptyWithSeeds
        ? "🌱 點一塊空地，種下種子吧！"
        : seedList.length === 0 && garden.plots.every((p) => !p.plant)
          ? "沒有種子了，去冒險解謎題就能拿到！"
          : "植物正在慢慢長大，晚點再回來看看！";

  return (
    <div className="lgp-garden">
      <div className="lgp-head">
        <h2>🌱 腦腦的花園</h2>
        <span className="lgp-qno">{scale > 1 ? "⏩ 測試快轉中" : sky.label}</span>
      </div>

      <div className="lgp-g-res" aria-label="我的東西">
        <span>🌰 種子 {Object.values(garden.seeds).reduce((a, b) => a + (b ?? 0), 0)}</span>
        <span>🧺 果實 {Object.values(garden.basket).reduce((a, b) => a + (b ?? 0), 0)}</span>
        <span>🧪 肥料 {garden.fertilizer}</span>
        <span>📷 {garden.visitors.length}/{VISITORS.length}</span>
      </div>

      <div className={`lgp-g-scene sky-${sky.cls}`}>
        {sky.cls === "night" && <div className="lgp-g-stars" aria-hidden="true" />}
        <div className="lgp-g-sun" aria-hidden="true" />
        <div className="lgp-g-hill a" aria-hidden="true" />
        <div className="lgp-g-hill b" aria-hidden="true" />
        <div className="lgp-g-fence" aria-hidden="true" />

        <div className="lgp-g-plots" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {garden.plots.map((p, i) => {
            const st = statuses[i];
            const stage = st.kind === "ready" ? 3 : st.kind === "growing" ? st.stage : 0;
            const selected = sel?.kind === "plot" && sel.i === i;
            const label = st.kind === "empty" ? "空地" : `${plantById(st.plant).name}（${st.kind === "ready" ? "可以收成" : st.kind === "thirsty" ? "口渴" : "長大中"}）`;
            return (
              <button key={i} className={`lgp-g-plot ${st.kind}${selected ? " sel" : ""}`} aria-label={`第 ${i + 1} 塊土：${label}`}
                onClick={() => {
                  if (st.kind === "ready") return doHarvest(i);
                  if (st.kind === "thirsty") return doWater(i);
                  sfx.tap(); setSel(selected ? null : { kind: "plot", i });
                }}>
                <span className="lgp-g-soil" />
                {st.kind !== "empty" && <Svg html={plantSvg(st.plant, stage)} className={`lgp-g-plant${st.kind === "ready" ? " ready" : ""}`} />}
                {st.kind === "thirsty" && <span className="lgp-g-badge drop">💧</span>}
                {st.kind === "ready" && <span className="lgp-g-badge sparkle">✨</span>}
                {st.kind === "growing" && <span className="lgp-g-progress"><i style={{ width: `${Math.round(st.progress * 100)}%` }} /></span>}
                {st.kind === "empty" && <span className="lgp-g-plus">＋</span>}
                {fx && fx.plot === i && fx.kind === "water" && <span key={fx.key} className="lgp-g-rain" aria-hidden="true"><i /><i /><i /><i /></span>}
                {fx && fx.plot === i && fx.kind === "plant" && <span key={fx.key} className="lgp-g-puff" aria-hidden="true" />}
                {fx && fx.plot === i && fx.kind === "harvest" && fx.fruit && <Svg key={fx.key} html={fruitSvg(fx.fruit)} className="lgp-g-fly" />}
              </button>
            );
          })}
        </div>

        {placed.map(({ v, x, y, flying }) => {
          const isNew = !garden.visitors.includes(v);
          return (
            <button key={v} className={`lgp-g-visitor v-${v}${flying ? " fly" : ""}`} style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={`${visitorById(v).name}${isNew ? "（還沒拍過照）" : ""}`} onClick={() => doPhoto(v)}>
              <Svg html={visitorSvg(v)} />
              {isNew && <span className="lgp-g-cam">📷</span>}
            </button>
          );
        })}

        <button className={`lgp-g-pet${sel?.kind === "pet" ? " sel" : ""}`} aria-label="腦腦（點一下餵食）" onClick={() => { sfx.tap(); setSel(sel?.kind === "pet" ? null : { kind: "pet" }); }}>
          <svg viewBox="0 0 120 120" className={`lgp-mood-${mood}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: petSvg(petStage, petStars, mood, look) }} />
        </button>

        <button className={`lgp-g-plate${sel?.kind === "plate" ? " sel" : ""}`} aria-label={plateOn ? `點心盤：${plantById(plateOn).fruitName}` : "點心盤（空的）"}
          onClick={() => { sfx.tap(); setSel(sel?.kind === "plate" ? null : { kind: "plate" }); }}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="50" cy="70" rx="44" ry="14" fill="#fff" stroke="#23305a" strokeWidth="3" />
            <ellipse cx="50" cy="66" rx="30" ry="8" fill="#e3e9fb" />
          </svg>
          {plateOn && <Svg html={fruitSvg(plateOn)} className="lgp-g-plate-food" />}
        </button>

        {fx?.kind === "photo" && <div key={fx.key} className="lgp-g-flash" aria-hidden="true" />}
      </div>

      {/* 操作面板 */}
      <div className="lgp-g-panel" aria-live="polite">
        {!sel && <p className="lgp-g-tip">{tip}</p>}

        {sel?.kind === "plot" && (() => {
          const st = statuses[sel.i];
          if (st.kind === "empty") {
            return seedList.length ? (
              <>
                <p className="lgp-g-ask">要種什麼呢？</p>
                <div className="lgp-g-choices">
                  {seedList.map((p) => (
                    <button key={p.id} className="lgp-g-choice" onClick={() => doPlant(sel.i, p.id)}>
                      <Svg html={seedPacketSvg(p.id)} />
                      <span>{p.name} ×{garden.seeds[p.id]}</span>
                      <small>{friendlyTime(p.hours * 3600_000 / scale).replace("再", "")}</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="lgp-g-empty">
                <p>沒有種子了！每解開一題謎題就能拿到一顆。</p>
                <button className="lgp-key go" onClick={onGoMap}>🗺️ 去冒險拿種子</button>
              </div>
            );
          }
          if (st.kind === "growing") {
            const p = plantById(st.plant);
            return (
              <div className="lgp-g-info">
                <Svg html={plantSvg(st.plant, st.stage)} className="lgp-g-info-art" />
                <div>
                  <p className="lgp-g-ask">{p.name}正在長大</p>
                  <div className="lgp-bar"><i style={{ width: `${Math.round(st.progress * 100)}%` }} /></div>
                  <p className="lgp-g-time">{friendlyTime(st.remainingMs)}</p>
                  {garden.fertilizer > 0 && <button className="lgp-key" onClick={() => doFertilize(sel.i)}>🧪 用肥料，馬上長好（剩 {garden.fertilizer}）</button>}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {(sel?.kind === "pet" || sel?.kind === "plate") && (
          fruitList.length ? (
            <>
              <p className="lgp-g-ask">{sel.kind === "pet" ? "要餵腦腦吃什麼？" : "要在點心盤放什麼？"}</p>
              <div className="lgp-g-choices">
                {fruitList.map((p) => (
                  <button key={p.id} className="lgp-g-choice" onClick={() => (sel.kind === "pet" ? doFeed(p.id) : doPlate(p.id))}>
                    <Svg html={fruitSvg(p.id)} />
                    <span>{p.fruitName} ×{garden.basket[p.id]}</span>
                    <small>{sel.kind === "pet" ? `+${feedStars(p.id)} ⭐` : `引來${visitorById(p.visitor).name}`}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="lgp-g-tip">{sel.kind === "pet" ? "籃子裡還沒有果實。先種東西、等它成熟再收成吧！" : "點心盤可以放果實，吸引小動物來玩。先去收成吧！"}</p>
          )
        )}
      </div>

      {expansion && <p className="lgp-note">🏡 再收成 {expansion.at - garden.harvests} 次，花園會擴建成 {expansion.plots} 塊土地！</p>}

      {/* 訪客圖鑑 */}
      <section className="lgp-g-book" aria-label="訪客圖鑑">
        <h3>📷 訪客圖鑑 {garden.visitors.length}/{VISITORS.length}</h3>
        <p className="lgp-note">還沒遇過的朋友，只看得到謎語提示。想想看該種什麼？</p>
        <div className="lgp-g-book-grid">
          {VISITORS.map((v) => {
            const met = garden.visitors.includes(v.id);
            return (
              <div key={v.id} className={met ? "lgp-g-card met" : "lgp-g-card"}>
                {met ? <Svg html={visitorSvg(v.id)} className="lgp-g-card-art" label={v.name} /> : <div className="lgp-g-card-q">?</div>}
                <strong>{met ? v.name : "？？？"}</strong>
                <small>{met ? v.met : v.hint}</small>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
