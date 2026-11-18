/** 數織（Nonogram）：產生器 + 唯一解驗算 */
import { defaultRng, type Rng } from "./random";

export type Grid = number[][]; // 1 = 塗, 0 = 空

export interface NonogramPuzzle {
  n: number;
  solution: Grid;
  rowClues: number[][];
  colClues: number[][];
}

export function runs(line: ArrayLike<number | boolean>): number[] {
  const r: number[] = [];
  let c = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i]) c++;
    else if (c) {
      r.push(c);
      c = 0;
    }
  }
  if (c) r.push(c);
  return r;
}

export function cluesOf(solution: Grid): { rowClues: number[][]; colClues: number[][] } {
  return {
    rowClues: solution.map((row) => runs(row)),
    colClues: solution[0].map((_, c) => runs(solution.map((row) => row[c]))),
  };
}

const sameClue = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

function linePatterns(n: number, clue: number[]): number[][] {
  const out: number[][] = [];
  for (let m = 0; m < 1 << n; m++) {
    const line = Array.from({ length: n }, (_, i) => (m >> i) & 1);
    if (sameClue(runs(line), clue)) out.push(line);
  }
  return out;
}

/** 某一直行目前填到一半，還有沒有可能符合提示 */
function colPrefixOk(cells: number[], clue: number[], remaining: number): boolean {
  const closed: number[] = [];
  let c = 0;
  for (const v of cells) {
    if (v) c++;
    else if (c) {
      closed.push(c);
      c = 0;
    }
  }
  const open = c;
  if (closed.length > clue.length) return false;
  for (let i = 0; i < closed.length; i++) if (closed[i] !== clue[i]) return false;
  const idx = closed.length;
  let need: number;
  if (open) {
    if (idx >= clue.length || open > clue[idx]) return false;
    const rest = clue.slice(idx + 1);
    need = clue[idx] - open + rest.reduce((a, b) => a + b, 0) + rest.length;
  } else {
    const rest = clue.slice(idx);
    need = rest.reduce((a, b) => a + b, 0) + Math.max(0, rest.length - 1);
  }
  return need <= remaining;
}

/** 數有幾種塗法（數到 limit 就停） */
export function countSolutions(n: number, rowClues: number[][], colClues: number[][], limit = 2): number {
  const pats = rowClues.map((c) => linePatterns(n, c));
  const grid: number[][] = [];
  let count = 0;
  const go = (r: number) => {
    if (count >= limit) return;
    if (r === n) {
      count++;
      return;
    }
    for (const p of pats[r]) {
      grid[r] = p;
      let ok = true;
      for (let c = 0; c < n && ok; c++) {
        ok = colPrefixOk(grid.slice(0, r + 1).map((row) => row[c]), colClues[c], n - r - 1);
      }
      if (ok) go(r + 1);
      if (count >= limit) return;
    }
  };
  go(0);
  return count;
}

export function isUnique(p: NonogramPuzzle): boolean {
  return countSolutions(p.n, p.rowClues, p.colClues) === 1;
}

/**
 * 用「一排一排推理」的方式解（小孩實際的解法，不用猜）。
 * 回傳能不能完全解開，以及要來回掃幾輪——輪數越多越難。
 */
export function lineSolve(p: NonogramPuzzle): { solved: boolean; sweeps: number } {
  const { n } = p;
  const know: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  const rowPats = p.rowClues.map((c) => linePatterns(n, c));
  const colPats = p.colClues.map((c) => linePatterns(n, c));
  const deduce = (cells: number[], pats: number[][]): number[] => {
    const ok = pats.filter((pt) => pt.every((v, i) => cells[i] < 0 || cells[i] === v));
    return cells.map((v, i) => (v >= 0 || !ok.length ? v : ok.every((pt) => pt[i] === ok[0][i]) ? ok[0][i] : -1));
  };
  let sweeps = 0;
  for (;;) {
    let changed = false;
    for (let r = 0; r < n; r++) {
      const next = deduce(know[r], rowPats[r]);
      next.forEach((v, c) => { if (v !== know[r][c]) { know[r][c] = v; changed = true; } });
    }
    for (let c = 0; c < n; c++) {
      const next = deduce(know.map((row) => row[c]), colPats[c]);
      next.forEach((v, r) => { if (v !== know[r][c]) { know[r][c] = v; changed = true; } });
    }
    if (!changed) break;
    sweeps++;
  }
  return { solved: know.every((row) => row.every((v) => v >= 0)), sweeps };
}

export function fromSolution(solution: Grid): NonogramPuzzle {
  return { n: solution.length, solution, ...cluesOf(solution) };
}

/** 亂數產生一題「只有一種塗法」的數織 */
export function makeRandom(n: number, rng: Rng = defaultRng): NonogramPuzzle {
  for (let t = 0; t < 500; t++) {
    const solution = Array.from({ length: n }, () => Array.from({ length: n }, () => (rng() < 0.58 ? 1 : 0)));
    const p = fromSolution(solution);
    if (p.rowClues.some((c) => !c.length) || p.colClues.some((c) => !c.length)) continue;
    // 一定要能一排一排推出來（不用猜），小孩才解得開
    if (isUnique(p) && lineSolve(p).solved) return p;
  }
  throw new Error(`無法產生 ${n}×${n} 唯一解數織`);
}

export function isSolved(state: number[][], p: NonogramPuzzle): boolean {
  return state.every((row, r) => row.every((v, c) => (v === 1) === (p.solution[r][c] === 1)));
}
