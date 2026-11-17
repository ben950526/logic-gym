/**
 * 冒險路線圖：一條往前走的路，每個點是一關。
 * 每章 10 關：第 5 關是寶箱，第 10 關是 BOSS（比較難、獎勵比較多）。
 * 三種謎題輪流出現，難度隨著走越遠越高。
 */
import type { GameKind } from "./save";

export const NODES_PER_CHAPTER = 10;
export const CHEST_SLOT = 4; // 每章第 5 個點
export const BOSS_SLOT = 9; // 每章第 10 個點
export const BOSS_BONUS_STARS = 2; // BOSS 額外多給的星星
const GAMES: GameKind[] = ["nono", "stroke", "sudoku"];

export interface AdvNode {
  index: number;
  chapter: number;
  slot: number;
  kind: "puzzle" | "chest";
  game?: GameKind;
  boss: boolean;
  level: number;
}

export function nodeAt(k: number): AdvNode {
  const chapter = Math.floor(k / NODES_PER_CHAPTER);
  const slot = k % NODES_PER_CHAPTER;
  if (slot === CHEST_SLOT) return { index: k, chapter, slot, kind: "chest", boss: false, level: 0 };
  const chestsBefore = chapter + (slot > CHEST_SLOT ? 1 : 0);
  const p = k - chestsBefore; // 第幾道謎題（不算寶箱）
  const boss = slot === BOSS_SLOT;
  const base = Math.floor(p / GAMES.length) + 1;
  return { index: k, chapter, slot, kind: "puzzle", game: GAMES[p % GAMES.length], boss, level: boss ? base + 4 : base };
}

export interface ChapterTheme {
  name: string;
  ground: string; // 背景色
  path: string; // 路的顏色
  decor: "meadow" | "forest" | "beach" | "snow" | "volcano" | "space";
}

export const CHAPTERS: ChapterTheme[] = [
  { name: "草原小徑", ground: "#dff5d8", path: "#c9a26b", decor: "meadow" },
  { name: "蘑菇森林", ground: "#cfeccf", path: "#a5794a", decor: "forest" },
  { name: "海邊沙灘", ground: "#fff1c9", path: "#e3b65c", decor: "beach" },
  { name: "雪山冰原", ground: "#e4f1ff", path: "#9fb7d6", decor: "snow" },
  { name: "火山洞窟", ground: "#ffe1d4", path: "#b8664a", decor: "volcano" },
  { name: "星空城堡", ground: "#e6e0ff", path: "#8b7bd8", decor: "space" },
];

export const chapterTheme = (chapter: number) => CHAPTERS[chapter % CHAPTERS.length];

/** 第幾章的完整名稱：第 7 章以後主題會重複，加上「第二輪」區分 */
export function chapterTitle(chapter: number): string {
  const lap = Math.floor(chapter / CHAPTERS.length);
  return `第 ${chapter + 1} 章 · ${chapterTheme(chapter).name}${lap ? `（第 ${lap + 1} 輪）` : ""}`;
}

/** 點在章節裡的位置：y 以像素計，x 以百分比計（左右彎曲的路） */
export const NODE_GAP = 92;
export const CHAPTER_TOP = 112;
export function nodePos(k: number): { x: number; y: number } {
  const slot = k % NODES_PER_CHAPTER;
  return { x: 50 + 26 * Math.sin(k * 0.95), y: CHAPTER_TOP + slot * NODE_GAP };
}
export const CHAPTER_HEIGHT = CHAPTER_TOP + (NODES_PER_CHAPTER - 1) * NODE_GAP + 70;
