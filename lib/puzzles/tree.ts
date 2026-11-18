/**
 * 「我的樹」：每解開一題，樹就喝到一滴水、長大一點。
 * 全部用程式畫（viewBox 0 0 200 220），每一滴水都會讓畫面有看得到的變化：
 *   3～44 滴：多長一團葉子、樹變大一點
 *   25 滴起：開花；36 滴起：每滴多結一顆果子
 *   50：鞦韆；60 起每滴多一顆小燈；70：樹屋；100：樹頂的星星
 */
import { seededRng } from "./random";

const INK = "#23305a";

export interface TreeStage {
  at: number; // 需要幾滴水
  name: string;
  say: string; // 長到這個階段時說的話
}

export const TREE_STAGES: TreeStage[] = [
  { at: 0, name: "一顆種子", say: "解開一題，幫種子澆第一滴水吧！" },
  { at: 1, name: "發芽了", say: "種子發芽了！" },
  { at: 3, name: "小樹苗", say: "長成小樹苗了！" },
  { at: 6, name: "小樹", say: "長成一棵小樹了！" },
  { at: 12, name: "長高的樹", say: "樹越長越高了！" },
  { at: 20, name: "大樹", say: "變成一棵大樹了！" },
  { at: 25, name: "開花的樹", say: "樹開花了！好香！" },
  { at: 36, name: "結果的樹", say: "樹結出果子了！" },
  { at: 50, name: "有鞦韆的樹", say: "樹上多了一個鞦韆！" },
  { at: 70, name: "有樹屋的樹", say: "樹上蓋了一間小樹屋！" },
  { at: 100, name: "會發光的神奇大樹", say: "樹頂亮起了星星，你的樹完成了！" },
];

export const BOSS_DROPS = 3; // BOSS 關給的水滴

export function treeStageOf(drops: number): number {
  return TREE_STAGES.reduce((k, st, i) => (drops >= st.at ? i : k), 0);
}

export function nextTreeStage(drops: number): TreeStage | null {
  return TREE_STAGES[treeStageOf(drops) + 1] ?? null;
}

/** 這一階段的進度（0～1），給進度條用 */
export function stageProgress(drops: number): number {
  const cur = TREE_STAGES[treeStageOf(drops)];
  const nxt = nextTreeStage(drops);
  if (!nxt) return 1;
  return (drops - cur.at) / (nxt.at - cur.at);
}

/* ───────── 形狀資料（全樹尺寸，之後依成長縮放） ───────── */

const BASE = { x: 100, y: 196 }; // 樹根
const CROWN = { x: 100, y: 80, rx: 76, ry: 56 };
const CLUSTER_COUNT = 42;
const MAX_FRUIT = 24;
const MAX_LIGHTS = 40;
const GREENS = [
  { dark: "#2fa36f", light: "#5fd3a8" },
  { dark: "#3aa95c", light: "#7bd88a" },
  { dark: "#2b9a7a", light: "#58c9a0" },
];

interface Cluster { x: number; y: number; r: number; tone: number }

/** 葉子團：在樹冠橢圓裡均勻撒點，從樹幹頂端往外排序（越早長出來的越靠中間） */
const CLUSTERS: Cluster[] = (() => {
  const rng = seededRng(4242);
  const out: Cluster[] = [{ x: 100, y: 96, r: 24, tone: 0 }];
  let guard = 0;
  while (out.length < CLUSTER_COUNT && guard++ < 20000) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng());
    const x = CROWN.x + Math.cos(a) * CROWN.rx * d;
    const y = CROWN.y + Math.sin(a) * CROWN.ry * d;
    const r = 15 + rng() * 6;
    if (out.some((c) => Math.hypot(c.x - x, c.y - y) < 17)) continue;
    out.push({ x, y, r, tone: out.length % GREENS.length });
  }
  const first = out[0];
  const rest = out.slice(1).sort((a, b) => Math.hypot(a.x - 100, (a.y - 96) * 1.3) - Math.hypot(b.x - 100, (b.y - 96) * 1.3));
  return [first, ...rest];
})();

/** 花和果子掛在哪些葉子團上（固定順序，看起來不會每次亂跳） */
const ORDER = (() => {
  const rng = seededRng(77);
  const idx = CLUSTERS.map((_, i) => i).slice(1);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
})();

/** 成長倍率：小樹苗 0.35 → 40 滴時全尺寸 */
function growScale(drops: number): number {
  return 0.35 + 0.65 * Math.min(1, Math.max(0, drops - 3) / 37);
}

const f1 = (n: number) => Math.round(n * 10) / 10;

export interface TreeCounts {
  clusters: number;
  flowers: number;
  fruits: number;
  swing: boolean;
  house: boolean;
  lights: number;
  star: boolean;
}

/** 這個水滴數會畫出哪些東西（測試也用這個確認「每一滴都有變化」） */
export function treeCounts(drops: number): TreeCounts {
  return {
    clusters: drops < 3 ? 0 : Math.min(CLUSTER_COUNT, drops - 2),
    flowers: drops < 25 ? 0 : Math.min(16, drops - 24),
    fruits: drops < 36 ? 0 : Math.min(MAX_FRUIT, drops - 35),
    swing: drops >= 50,
    house: drops >= 70,
    lights: drops < 60 ? 0 : Math.min(MAX_LIGHTS, drops - 59),
    star: drops >= 100,
  };
}

/** 跟上一滴相比，這一滴多了什麼（過關畫面的一句話） */
export function growthNote(drops: number): string {
  const a = treeCounts(drops - 1);
  const b = treeCounts(drops);
  if (b.star && !a.star) return "樹頂亮起了星星！";
  if (b.house && !a.house) return "樹上蓋好了小樹屋！";
  if (b.swing && !a.swing) return "樹上掛了一個鞦韆！";
  if (b.lights > a.lights) return "樹上多了一顆小燈！";
  if (b.fruits > a.fruits) return "樹上多結了一顆果子！";
  if (b.flowers > a.flowers) return "樹上多開了一朵花！";
  if (b.clusters > a.clusters) return "樹長出新的葉子了！";
  if (drops === 1) return "種子發芽了！";
  if (drops === 2) return "小芽又長高了！";
  return "樹喝飽了水，長得更壯了！";
}

function ground(): string {
  return `<ellipse cx="100" cy="204" rx="86" ry="17" fill="#8ccb78" stroke="${INK}" stroke-width="3"/>
<path d="M30 200 q4 -8 7 0 M48 207 q3 -7 6 0 M150 206 q3 -7 6 0 M166 199 q4 -8 7 0" fill="none" stroke="#4f9a4a" stroke-width="2.5" stroke-linecap="round"/>`;
}

function seedArt(drops: number): string {
  if (drops === 0) {
    return `<ellipse cx="100" cy="197" rx="10" ry="7" fill="#a5794a" stroke="${INK}" stroke-width="2.5"/>
<path d="M96 194 q4 -3 8 0" stroke="#fff6dc" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  const h = drops === 1 ? 22 : 36;
  const top = 198 - h;
  const leaf = (x: number, y: number, dir: number, s: number) =>
    `<path class="lgp-t-leaf" d="M${x} ${y} q${14 * dir * s} ${-14 * s} ${26 * dir * s} ${-4 * s} q${-10 * dir * s} ${12 * s} ${-26 * dir * s} ${4 * s} z" fill="#5fd3a8" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return `<path d="M100 198 q-3 ${-h / 2} 0 ${-h}" stroke="#3aa95c" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M100 198 q-3 ${-h / 2} 0 ${-h}" stroke="${INK}" stroke-width="1" fill="none" opacity=".25"/>
${leaf(100, top + 2, -1, 1)}${leaf(100, top + 2, 1, 1)}
${drops >= 2 ? `${leaf(99, top + 18, -1, 0.8)}${leaf(101, top + 22, 1, 0.8)}` : ""}`;
}

/**
 * 畫出整棵樹。newest = true 時，最新長出來的那樣東西會有「冒出來」的動畫。
 */
export function treeSvg(drops: number, newest = false): string {
  if (drops < 3) return ground() + `<g class="lgp-t-crown">${seedArt(drops)}</g>`;
  const s = growScale(drops);
  const P = (x: number, y: number) => ({ x: f1(BASE.x + (x - BASE.x) * s), y: f1(BASE.y + (y - BASE.y) * s) });
  const R = (r: number) => f1(r * (0.55 + 0.45 * s));
  const W = (w: number) => f1(w * (0.6 + 0.4 * s));
  const c = treeCounts(drops);
  const prev = treeCounts(drops - 1);
  const isNew = (cond: boolean) => (newest && cond ? " lgp-t-new" : "");

  // 樹幹（上窄下寬）
  const top = P(100, 96);
  const bw = W(13), tw = W(6);
  const trunk = `<path d="M${f1(BASE.x - bw)} ${BASE.y + 2} C${f1(BASE.x - bw * 0.8)} ${f1((BASE.y + top.y) / 2)} ${f1(top.x - tw)} ${f1(top.y + 20 * s)} ${f1(top.x - tw)} ${top.y}
L${f1(top.x + tw)} ${top.y} C${f1(top.x + tw)} ${f1(top.y + 20 * s)} ${f1(BASE.x + bw * 0.8)} ${f1((BASE.y + top.y) / 2)} ${f1(BASE.x + bw)} ${BASE.y + 2} Z"
fill="#a5794a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M${f1(BASE.x - bw * 0.3)} ${BASE.y - 6} q-2 ${f1(-30 * s)} 0 ${f1(-60 * s)}" stroke="#c99a68" stroke-width="${W(2.5)}" fill="none" stroke-linecap="round"/>`;

  // 葉子：先畫所有外框，再畫填色，最後畫亮面 → 看起來是一整朵雲狀的樹冠
  const shown = CLUSTERS.slice(0, c.clusters).map((cl, i) => ({ ...P(cl.x, cl.y), r: R(cl.r), tone: cl.tone, fresh: i >= prev.clusters }));
  const layer = (fn: (k: (typeof shown)[number]) => string) =>
    shown.map((k) => `<g class="lgp-t-part${isNew(k.fresh)}">${fn(k)}</g>`).join("");
  const leaves = layer((k) => `<circle cx="${k.x}" cy="${k.y}" r="${f1(k.r + 3)}" fill="${INK}"/>`)
    + layer((k) => `<circle cx="${k.x}" cy="${k.y}" r="${k.r}" fill="${GREENS[k.tone].dark}"/>`)
    + layer((k) => `<circle cx="${f1(k.x - k.r * 0.18)}" cy="${f1(k.y - k.r * 0.2)}" r="${f1(k.r * 0.72)}" fill="${GREENS[k.tone].light}"/>`)
    + layer((k) => `<circle cx="${f1(k.x - k.r * 0.4)}" cy="${f1(k.y - k.r * 0.42)}" r="${f1(k.r * 0.16)}" fill="#fff" opacity=".55"/>`);

  // 花
  const flowers = ORDER.slice(0, c.flowers).map((ci, i) => {
    const cl = CLUSTERS[ci];
    const p = P(cl.x + cl.r * 0.35, cl.y - cl.r * 0.1);
    const petals = [0, 72, 144, 216, 288].map((a) => {
      const rad = (a * Math.PI) / 180;
      return `<circle cx="${f1(p.x + Math.cos(rad) * 3.6)}" cy="${f1(p.y + Math.sin(rad) * 3.6)}" r="3.2" fill="#ffb3cf" stroke="${INK}" stroke-width="1.2"/>`;
    }).join("");
    return `<g class="lgp-t-part${isNew(i >= prev.flowers)}">${petals}<circle cx="${p.x}" cy="${p.y}" r="2.4" fill="#ffc93c"/></g>`;
  }).join("");

  // 果子（掛在偏下面的葉子團上）
  const fruitSpots = [...ORDER].reverse();
  const fruits = Array.from({ length: c.fruits }, (_, i) => {
    const cl = CLUSTERS[fruitSpots[i % fruitSpots.length]];
    const off = i >= fruitSpots.length ? -0.45 : 0.3;
    const p = P(cl.x - cl.r * off, cl.y + cl.r * 0.45);
    return `<g class="lgp-t-part${isNew(i >= prev.fruits)}"><circle cx="${p.x}" cy="${p.y}" r="5.2" fill="#ff5d73" stroke="${INK}" stroke-width="2"/>
<circle cx="${f1(p.x - 1.8)}" cy="${f1(p.y - 1.8)}" r="1.4" fill="#fff" opacity=".8"/>
<path d="M${p.x} ${f1(p.y - 5)} q2 -3 5 -3" stroke="#2fa36f" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  }).join("");

  // 鞦韆（掛在左邊的樹枝上）
  const swing = c.swing
    ? `<g class="lgp-t-part${isNew(!prev.swing)}"><g class="lgp-t-swing">
<path d="M66 110 V170 M84 124 V172" stroke="${INK}" stroke-width="2"/>
<rect x="60" y="168" width="30" height="7" rx="3" fill="#ffc93c" stroke="${INK}" stroke-width="2.5" transform="rotate(4 75 171)"/></g></g>`
    : "";

  // 樹屋
  const house = c.house
    ? `<g class="lgp-t-part${isNew(!prev.house)}">
<path d="M94 172 V138 M106 172 V138 M94 146 H106 M94 156 H106 M94 166 H106" stroke="${INK}" stroke-width="2.5"/>
<rect x="76" y="118" width="48" height="6" rx="2" fill="#c99a68" stroke="${INK}" stroke-width="2.5"/>
<rect x="82" y="96" width="36" height="23" rx="2" fill="#ffe1b0" stroke="${INK}" stroke-width="2.5"/>
<path d="M77 98 L100 80 L123 98 Z" fill="#ff5d73" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="94" y="104" width="12" height="10" rx="2" fill="#8fd3ff" stroke="${INK}" stroke-width="2"/>
<path d="M100 104 V114 M94 109 H106" stroke="${INK}" stroke-width="1.5"/></g>`
    : "";

  // 小燈：沿著樹冠邊緣排一圈
  const lights = Array.from({ length: c.lights }, (_, i) => {
    const t = Math.PI * (1.05 + (i / (MAX_LIGHTS - 1)) * 0.9);
    const x = f1(CROWN.x + Math.cos(t) * (CROWN.rx - 4));
    const y = f1(CROWN.y + 6 + Math.sin(t) * (CROWN.ry - 2)); // sin(t) < 0 → 樹冠上半圈
    return `<g class="lgp-t-part${isNew(i >= prev.lights)}"><circle class="lgp-t-light" style="animation-delay:${(i % 5) * 0.3}s" cx="${x}" cy="${y}" r="3.4" fill="#ffe066" stroke="${INK}" stroke-width="1.4"/></g>`;
  }).join("");

  const star = c.star
    ? `<g class="lgp-t-part${isNew(!prev.star)}"><path class="lgp-t-star" d="M100 6 l5 11 l12 1.5 l-9 8 l2.6 12 l-10.6 -6 l-10.6 6 l2.6 -12 l-9 -8 l12 -1.5 z" fill="#ffc93c" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g>`
    : "";

  return ground() + swing + `<g class="lgp-t-crown">${trunk}${leaves}${flowers}${fruits}${lights}</g>` + house + star;
}

/** 鏡頭：樹小的時候拉近，樹長大後慢慢拉遠（從地面往上對齊） */
export function treeViewBox(drops: number): string {
  const z = 0.6 + 0.4 * Math.min(1, drops / 40);
  const w = 200 * z, h = 220 * z;
  return `${f1(100 - w / 2)} ${f1(222 - h)} ${f1(w)} ${f1(h)}`;
}
