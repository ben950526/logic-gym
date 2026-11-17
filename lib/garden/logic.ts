/**
 * 花園邏輯（純函式，不碰畫面，方便自動測試）。
 * 所有時間都用毫秒時間戳；scale 是時間倍率（測試模式 600 倍）。
 */
import { defaultRng, randInt, type Rng } from "../puzzles/random";
import { COMMON_PLANTS, plantById, PLANTS, RARE_PLANTS, VISITORS, type PlantId, type VisitorId } from "./catalog";

export interface Plot {
  plant: PlantId | null;
  plantedAt: number | null;
  wateredAt: number | null; // null = 還沒澆水（不會長）
}

export interface GardenState {
  started: boolean; // 新手禮物發過了沒
  seeds: Partial<Record<PlantId, number>>;
  basket: Partial<Record<PlantId, number>>; // 收成的果實
  fertilizer: number;
  plots: Plot[];
  harvests: number; // 累積收成次數（用來擴建）
  visitors: VisitorId[]; // 拍過照的訪客
  plate: PlantId | null; // 點心盤上的果實
  plateAt: number | null;
  fed: number; // 餵過腦腦幾次
}

export const PLATE_HOURS = 3;
export const STAGE_COUNT = 4; // 0 發芽、1 小苗、2 花苞、3 成熟
export const STARTER_SEEDS: Partial<Record<PlantId, number>> = { tulip: 2, carrot: 1 };
const HOUR = 3600_000;

export const emptyPlot = (): Plot => ({ plant: null, plantedAt: null, wateredAt: null });

export const emptyGarden = (): GardenState => ({
  started: false,
  seeds: {},
  basket: {},
  fertilizer: 0,
  plots: Array.from({ length: 4 }, emptyPlot),
  harvests: 0,
  visitors: [],
  plate: null,
  plateAt: null,
  fed: 0,
});

/** 依累積收成，花園有幾格土地 */
export function plotCountFor(harvests: number): number {
  if (harvests >= 15) return 9;
  if (harvests >= 5) return 6;
  return 4;
}

export function nextExpansion(harvests: number): { at: number; plots: number } | null {
  if (harvests < 5) return { at: 5, plots: 6 };
  if (harvests < 15) return { at: 15, plots: 9 };
  return null;
}

/** 確保土地數量正確（擴建後補新的空地） */
export function normalize(g: GardenState): GardenState {
  const want = plotCountFor(g.harvests);
  if (g.plots.length >= want) return g;
  return { ...g, plots: [...g.plots, ...Array.from({ length: want - g.plots.length }, emptyPlot)] };
}

/** 第一次進花園：送新手種子 */
export function ensureStarted(g: GardenState): GardenState {
  if (g.started) return g;
  const seeds = { ...g.seeds };
  for (const [id, n] of Object.entries(STARTER_SEEDS) as [PlantId, number][]) seeds[id] = (seeds[id] ?? 0) + n;
  return { ...g, started: true, seeds };
}

export const growMs = (id: PlantId, scale = 1) => (plantById(id).hours * HOUR) / scale;

export type PlotStatus =
  | { kind: "empty" }
  | { kind: "thirsty"; plant: PlantId }
  | { kind: "growing"; plant: PlantId; stage: number; progress: number; remainingMs: number }
  | { kind: "ready"; plant: PlantId };

export function plotStatus(p: Plot, now: number, scale = 1): PlotStatus {
  if (!p.plant) return { kind: "empty" };
  if (p.wateredAt === null) return { kind: "thirsty", plant: p.plant };
  const total = growMs(p.plant, scale);
  const elapsed = Math.max(0, now - p.wateredAt);
  if (elapsed >= total) return { kind: "ready", plant: p.plant };
  const progress = elapsed / total;
  return { kind: "growing", plant: p.plant, stage: Math.min(2, Math.floor(progress * 3)), progress, remainingMs: total - elapsed };
}

const add = <K extends string>(rec: Partial<Record<K, number>>, k: K, n: number) => ({ ...rec, [k]: Math.max(0, (rec[k] ?? 0) + n) });

export function plant(g: GardenState, plot: number, id: PlantId, now: number): GardenState {
  const p = g.plots[plot];
  if (!p || p.plant || (g.seeds[id] ?? 0) < 1) return g;
  const plots = g.plots.slice();
  plots[plot] = { plant: id, plantedAt: now, wateredAt: null };
  return { ...g, plots, seeds: add(g.seeds, id, -1) };
}

export function water(g: GardenState, plot: number, now: number): GardenState {
  const p = g.plots[plot];
  if (!p?.plant || p.wateredAt !== null) return g;
  const plots = g.plots.slice();
  plots[plot] = { ...p, wateredAt: now };
  return { ...g, plots };
}

/** 肥料：馬上長好 */
export function fertilize(g: GardenState, plot: number, now: number, scale = 1): GardenState {
  const p = g.plots[plot];
  if (!p?.plant || g.fertilizer < 1) return g;
  const st = plotStatus(p, now, scale);
  if (st.kind === "ready" || st.kind === "empty") return g;
  const plots = g.plots.slice();
  plots[plot] = { ...p, wateredAt: now - growMs(p.plant, scale) };
  return { ...g, plots, fertilizer: g.fertilizer - 1 };
}

/** 收成：一年生的植物收完土地變空；蘋果樹會自己再長 */
export function harvest(g: GardenState, plot: number, now: number, scale = 1): { garden: GardenState; fruit: PlantId | null; expanded: boolean } {
  const p = g.plots[plot];
  if (!p?.plant || plotStatus(p, now, scale).kind !== "ready") return { garden: g, fruit: null, expanded: false };
  const fruit = p.plant;
  const plots = g.plots.slice();
  plots[plot] = plantById(fruit).perennial ? { ...p, wateredAt: now } : emptyPlot();
  const harvests = g.harvests + 1;
  const expanded = plotCountFor(harvests) > plotCountFor(g.harvests);
  return { garden: normalize({ ...g, plots, basket: add(g.basket, fruit, 1), harvests }), fruit, expanded };
}

/** 餵腦腦：普通果實 +1 星、稀有果實 +3 星 */
export function feedStars(id: PlantId): number {
  return plantById(id).rare ? 3 : 1;
}

export function feed(g: GardenState, id: PlantId): { garden: GardenState; stars: number } {
  if ((g.basket[id] ?? 0) < 1) return { garden: g, stars: 0 };
  return { garden: { ...g, basket: add(g.basket, id, -1), fed: g.fed + 1 }, stars: feedStars(id) };
}

export function placeOnPlate(g: GardenState, id: PlantId, now: number, scale = 1): GardenState {
  if ((g.basket[id] ?? 0) < 1) return g;
  // 盤子上原本的果實（還沒被吃完）放回籃子
  let basket = add(g.basket, id, -1);
  if (g.plate && plateActive(g, now, scale)) basket = add(basket, g.plate, 1);
  return { ...g, basket, plate: id, plateAt: now };
}

export function plateActive(g: GardenState, now: number, scale = 1): boolean {
  return !!g.plate && g.plateAt !== null && now - g.plateAt < (PLATE_HOURS * HOUR) / scale;
}

/** 現在花園裡有哪些訪客（條件達成就會來） */
export function visitorsPresent(g: GardenState, now: number, scale = 1): VisitorId[] {
  const ready = new Set<PlantId>();
  for (const p of g.plots) {
    const st = plotStatus(p, now, scale);
    if (st.kind === "ready") ready.add(st.plant);
  }
  const plate = plateActive(g, now, scale) ? g.plate : null;
  const out: VisitorId[] = [];
  for (const pl of PLANTS) if (ready.has(pl.id) || plate === pl.id) out.push(pl.visitor);
  if (ready.size >= 3) out.push("fox");
  if (plate === "watermelon") out.push("bear");
  return out.filter((v, i) => out.indexOf(v) === i);
}

export function photograph(g: GardenState, v: VisitorId): { garden: GardenState; isNew: boolean } {
  if (g.visitors.includes(v)) return { garden: g, isNew: false };
  return { garden: { ...g, visitors: [...g.visitors, v] }, isNew: true };
}

export const ALL_VISITORS = VISITORS.map((v) => v.id);

/* ───────── 獎勵 ───────── */

export interface SeedReward {
  seeds: PlantId[];
  fertilizer: number;
}

export function randomCommon(rng: Rng = defaultRng): PlantId {
  return COMMON_PLANTS[randInt(COMMON_PLANTS.length, rng)];
}
export function randomRare(rng: Rng = defaultRng): PlantId {
  return RARE_PLANTS[randInt(RARE_PLANTS.length, rng)];
}

/** 解開一題（BOSS 多給一顆稀有種子） */
export function puzzleReward(boss: boolean, rng: Rng = defaultRng): SeedReward {
  return { seeds: boss ? [randomCommon(rng), randomRare(rng)] : [randomCommon(rng)], fertilizer: 0 };
}

/** 冒險地圖路上的寶箱 */
export function pathChestReward(rng: Rng = defaultRng): SeedReward {
  return { seeds: [randomCommon(rng), rng() < 0.35 ? randomRare(rng) : randomCommon(rng)], fertilizer: 1 };
}

/** 每日任務寶箱 */
export function dailyChestReward(rng: Rng = defaultRng): SeedReward {
  return { seeds: [randomRare(rng)], fertilizer: 1 };
}

export function grant(g: GardenState, r: SeedReward): GardenState {
  let seeds = g.seeds;
  for (const s of r.seeds) seeds = add(seeds, s, 1);
  return { ...g, seeds, fertilizer: g.fertilizer + r.fertilizer };
}

/** 可以收成、口渴的植物數（顯示提醒用） */
export function attention(g: GardenState, now: number, scale = 1): { ready: number; thirsty: number; emptyWithSeeds: number } {
  let ready = 0, thirsty = 0, empty = 0;
  for (const p of g.plots) {
    const st = plotStatus(p, now, scale);
    if (st.kind === "ready") ready++;
    else if (st.kind === "thirsty") thirsty++;
    else if (st.kind === "empty") empty++;
  }
  const hasSeeds = Object.values(g.seeds).some((n) => (n ?? 0) > 0);
  return { ready, thirsty, emptyWithSeeds: hasSeeds ? empty : 0 };
}

/** 澆完水時腦腦說的話：多久會長好 */
export function growSentence(ms: number): string {
  const min = Math.ceil(ms / 60000);
  if (min <= 1) return "很快就會長好囉！";
  if (min < 60) return `再 ${min} 分鐘就會長好！`;
  const h = Math.round(min / 60);
  if (h >= 8) return `要等一個晚上（大約 ${h} 小時），明天再來看！`;
  return `再 ${h} 小時就會長好！`;
}

/** 給孩子看的剩餘時間 */
export function friendlyTime(ms: number): string {
  const min = Math.ceil(ms / 60000);
  if (min <= 1) return "馬上就好";
  if (min < 60) return `再 ${min} 分鐘`;
  const h = Math.round(min / 60);
  if (h >= 8) return `再睡一覺就好（約 ${h} 小時）`;
  return `再 ${h} 小時`;
}
