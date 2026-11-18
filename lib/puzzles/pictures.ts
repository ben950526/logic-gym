/**
 * 數織圖案題。每一張都必須「只有一種塗法」，而且能一排一排推出來（不用猜）——
 * 新增圖案後請跑 `npm run verify:puzzle-engine`，不合格的圖會被擋下來。
 * 出題順序會自動照難度排（見最下面的 PICTURES）。
 */
import { fromSolution, lineSolve, type NonogramPuzzle } from "./nonogram";

export interface Picture {
  name: string;
  color: string;
  rows: string[]; // "#" = 塗, "." = 空
}

const RAW_PICTURES: Picture[] = [
  { name: "愛心", color: "#ff5d73", rows: [".#.#.", "#####", "#####", ".###.", "..#.."] },
  { name: "房子", color: "#ff9f43", rows: ["..#..", ".###.", "#####", ".#.#.", ".###."] },
  { name: "大樹", color: "#2fbf8a", rows: ["..#..", ".###.", "#####", "..#..", "..#.."] },
  { name: "笑臉", color: "#ffc93c", rows: [".#.#.", ".#.#.", ".....", "##.##", ".###."] },
  { name: "蘑菇", color: "#ff5d73", rows: [".###.", "#####", "#.#.#", "..#..", ".###."] },
  { name: "雨傘", color: "#4d9fff", rows: [".###.", "#####", "..#..", "..#..", ".##.."] },
  { name: "鈴鐺", color: "#ffc93c", rows: ["..#..", ".###.", ".###.", "#####", "..#.."] },
  { name: "箭頭", color: "#7c5cff", rows: ["..#..", ".###.", "#.#.#", "..#..", "..#.."] },
  { name: "鑰匙", color: "#d99a00", rows: [".##..", "#..#.", ".##..", "..#..", "..##."] },
  { name: "皇冠", color: "#ffc93c", rows: ["#.#.#", "#####", "#####", ".....", "#####"] },
  { name: "十字", color: "#ff5d73", rows: ["..#..", "..#..", "#####", "..#..", "..#.."] },
  { name: "小貓", color: "#ff9f43", rows: ["#....#", "##..##", "######", "#.##.#", "######", ".####."] },
  { name: "小魚", color: "#4d9fff", rows: ["......", ".##..#", "####.#", "######", ".##..#", "......"] },
  { name: "火箭", color: "#7c5cff", rows: ["..##..", ".####.", ".#..#.", ".####.", "######", "#.##.#"] },
  { name: "星星", color: "#ffc93c", rows: ["...#...", "...#...", "#######", ".#####.", "..###..", ".##.##.", "##...##"] },
  { name: "兔子", color: "#ff8fb1", rows: [".#...#.", ".#...#.", ".##.##.", ".#####.", "##.#.##", "#######", ".#####."] },
  { name: "汽車", color: "#ff5d73", rows: [".......", "..###..", ".#####.", "#######", "#######", ".##.##.", "......."] },
  { name: "蝴蝶", color: "#7c5cff", rows: ["##...##", "###.###", "#######", "..###..", "#######", "###.###", "##...##"] },
  { name: "花朵", color: "#ff8fb1", rows: ["..###..", ".#####.", "..###..", "...#...", ".#.#.#.", "..###..", "...#..."] },
  { name: "烏龜", color: "#2fbf8a", rows: [".......", "...###.", "..#####", "##.#.##", "..#####", "..#...#", "......."] },
];

export function pictureGrid(p: Picture): number[][] {
  return p.rows.map((r) => [...r].map((ch) => (ch === "#" ? 1 : 0)));
}

export function picturePuzzle(p: Picture): NonogramPuzzle {
  return fromSolution(pictureGrid(p));
}

/**
 * 由簡單到難：先比大小（5×5 → 6×6 → 7×7），
 * 同樣大小再比「要來回推幾輪」，最後比塗的格子多寡（塗得多的比較好推）。
 */
export function pictureDifficulty(p: Picture): number {
  const pz = picturePuzzle(p);
  const filled = p.rows.join("").split("#").length - 1;
  return pz.n * 1000 + lineSolve(pz).sweeps * 100 - filled;
}

export const PICTURES: Picture[] = RAW_PICTURES
  .map((p) => ({ p, d: pictureDifficulty(p) }))
  .sort((a, b) => a.d - b.d)
  .map(({ p }) => p);
