/** 一筆畫：產生器 + 「一定畫得完」驗算（歐拉路徑） */
import { defaultRng, randInt, shuffle, type Rng } from "./random";

export interface StrokePuzzle {
  width: number;
  height: number;
  nodes: number[];
  edges: [number, number][];
  oddNodes: number[]; // 連著單數條線的點（起點、終點）
}

export function degrees(edges: [number, number][]): Record<number, number> {
  const deg: Record<number, number> = {};
  for (const [a, b] of edges) {
    deg[a] = (deg[a] ?? 0) + 1;
    deg[b] = (deg[b] ?? 0) + 1;
  }
  return deg;
}

/** 圖是連通的，而且單數點只有 0 或 2 個 → 一定畫得完 */
export function hasEulerPath(nodes: number[], edges: [number, number][]): boolean {
  if (!nodes.length) return false;
  const deg = degrees(edges);
  const adj: Record<number, number[]> = {};
  for (const [a, b] of edges) {
    (adj[a] ??= []).push(b);
    (adj[b] ??= []).push(a);
  }
  const odd = nodes.filter((n) => deg[n] % 2).length;
  const seen = new Set([nodes[0]]);
  const stack = [nodes[0]];
  while (stack.length) {
    const u = stack.pop()!;
    for (const v of adj[u] ?? []) if (!seen.has(v)) {
      seen.add(v);
      stack.push(v);
    }
  }
  return (odd === 0 || odd === 2) && seen.size === nodes.length;
}

/** 第 level 題要幾條線：從 6 條開始，每兩題多 1 條，最多 16 條（循序漸進） */
export function strokeTarget(level: number): number {
  return Math.min(16, 6 + Math.floor(Math.max(0, level - 1) / 2));
}

/** 線越多，格點也跟著變大 */
export function strokeGrid(target: number): { W: number; H: number } {
  if (target <= 8) return { W: 3, H: 3 };
  if (target <= 11) return { W: 4, H: 3 };
  return { W: 4, H: 4 };
}

export function makeStroke(level: number, rng: Rng = defaultRng): StrokePuzzle {
  const target = strokeTarget(level);
  const { W, H } = strokeGrid(target);
  const id = (x: number, y: number) => y * W + x;
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  let best: StrokePuzzle | null = null;

  for (let t = 0; t < 300; t++) {
    const used = new Set<string>();
    let cur = randInt(W * H, rng);
    for (let s = 0; s < target; s++) {
      const x = cur % W;
      const y = Math.floor(cur / W);
      const options = shuffle([...dirs], rng)
        .map(([dx, dy]) => ({ nx: x + dx, ny: y + dy, dx, dy }))
        .filter((e) => e.nx >= 0 && e.ny >= 0 && e.nx < W && e.ny < H)
        .map((e) => ({ ...e, to: id(e.nx, e.ny), diag: e.dx !== 0 && e.dy !== 0 }))
        .filter((e) => !used.has(key(cur, e.to)))
        // 兩條斜線不能交叉（交叉點沒有圓點，小孩會看不懂）
        .filter((e) => !e.diag || !used.has(key(id(x + e.dx, y), id(x, y + e.dy))));
      if (!options.length) break;
      used.add(key(cur, options[0].to));
      cur = options[0].to;
    }
    const edges = [...used].map((k) => k.split("-").map(Number) as [number, number]);
    const deg = degrees(edges);
    const nodes = Object.keys(deg).map(Number);
    const oddNodes = nodes.filter((n) => deg[n] % 2);
    const p: StrokePuzzle = { width: W, height: H, nodes, edges, oddNodes };
    // 要有兩個單數點：起點有講究，才會有「啊哈」
    if (edges.length >= target - 1 && oddNodes.length === 2) return p;
    if (!best || edges.length > best.edges.length) best = p;
  }
  return best!;
}
