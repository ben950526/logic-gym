/** 4×4 數獨：產生器 + 唯一解驗算 */
import { defaultRng, shuffle, type Rng } from "./random";

export interface SudokuPuzzle {
  solution: number[]; // 16 格，由左到右、由上到下
  givens: number[]; // 0 = 空格
}

export function countSolutions(grid: number[], limit = 2): number {
  let count = 0;
  const a = grid.slice();
  const go = () => {
    if (count >= limit) return;
    const i = a.indexOf(0);
    if (i < 0) {
      count++;
      return;
    }
    const r = Math.floor(i / 4), c = i % 4, br = r - (r % 2), bc = c - (c % 2);
    for (let v = 1; v <= 4; v++) {
      let ok = true;
      for (let k = 0; k < 4 && ok; k++) if (a[r * 4 + k] === v || a[k * 4 + c] === v) ok = false;
      for (let y = br; y < br + 2 && ok; y++) for (let x = bc; x < bc + 2; x++) if (a[y * 4 + x] === v) ok = false;
      if (ok) {
        a[i] = v;
        go();
        a[i] = 0;
        if (count >= limit) return;
      }
    }
  };
  go();
  return count;
}

export function isValidSolution(g: number[]): boolean {
  const groups: number[][] = [];
  for (let i = 0; i < 4; i++) {
    groups.push([0, 1, 2, 3].map((k) => g[i * 4 + k]));
    groups.push([0, 1, 2, 3].map((k) => g[k * 4 + i]));
    const br = Math.floor(i / 2) * 2, bc = (i % 2) * 2;
    groups.push([g[br * 4 + bc], g[br * 4 + bc + 1], g[(br + 1) * 4 + bc], g[(br + 1) * 4 + bc + 1]]);
  }
  return groups.every((gr) => [...gr].sort().join() === "1,2,3,4");
}

/** 某一格的數字是否和同列、同行、同方塊重複 */
export function hasConflict(state: number[], i: number): boolean {
  const v = state[i];
  if (!v) return false;
  const r = Math.floor(i / 4), c = i % 4, br = r - (r % 2), bc = c - (c % 2);
  for (let k = 0; k < 16; k++) {
    if (k === i || state[k] !== v) continue;
    const kr = Math.floor(k / 4), kc = k % 4;
    if (kr === r || kc === c || (kr - (kr % 2) === br && kc - (kc % 2) === bc)) return true;
  }
  return false;
}

/** level 越高，給的提示越少 */
export function makeSudoku(level: number, rng: Rng = defaultRng): SudokuPuzzle {
  const base = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
  const digits = shuffle([1, 2, 3, 4], rng);
  let g = base.map((v) => digits[v - 1]);
  const rows = [...shuffle([0, 1], rng), ...shuffle([2, 3], rng)];
  const bands = rng() < 0.5 ? [0, 1, 2, 3] : [2, 3, 0, 1];
  const cols = [...shuffle([0, 1], rng), ...shuffle([2, 3], rng)];
  const stacks = rng() < 0.5 ? [0, 1, 2, 3] : [2, 3, 0, 1];
  g = Array.from({ length: 16 }, (_, i) => g[rows[bands[Math.floor(i / 4)]] * 4 + cols[stacks[i % 4]]]);
  if (rng() < 0.5) g = Array.from({ length: 16 }, (_, i) => g[(i % 4) * 4 + Math.floor(i / 4)]);

  const solution = g.slice();
  const givens = g.slice();
  const target = level <= 2 ? 8 : level <= 5 ? 6 : 4;
  for (const i of shuffle([...Array(16).keys()], rng)) {
    if (givens.filter(Boolean).length <= target) break;
    const keep = givens[i];
    givens[i] = 0;
    if (countSolutions(givens) !== 1) givens[i] = keep;
  }
  return { solution, givens };
}
