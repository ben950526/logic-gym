/** 共用的亂數小工具（謎題產生器用） */

export type Rng = () => number;

export const defaultRng: Rng = Math.random;

export function randInt(n: number, rng: Rng = defaultRng): number {
  return Math.floor(rng() * n);
}

export function shuffle<T>(items: T[], rng: Rng = defaultRng): T[] {
  const a = items;
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1, rng);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 可重現的亂數（同一個 seed 產生同一串數字），之後做「每日任務」會用到 */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
