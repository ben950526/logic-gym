/** 玩家進度（訪客先存在這台裝置；之後登入再同步到 Supabase） */

export type GameKind = "nono" | "stroke" | "sudoku";

export interface PlaySave {
  solved: Record<GameKind, number>;
  stars: number;
  dex: string[]; // 已收集的圖鑑名稱
  muted: boolean;
}

const KEY = "logic-gym-play-v1";

export const emptySave = (): PlaySave => ({ solved: { nono: 0, stroke: 0, sudoku: 0 }, stars: 0, dex: [], muted: false });

export function loadSave(): PlaySave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const s = JSON.parse(raw) as Partial<PlaySave>;
    const base = emptySave();
    return { ...base, ...s, solved: { ...base.solved, ...(s.solved ?? {}) }, dex: Array.isArray(s.dex) ? s.dex : [] };
  } catch {
    return emptySave();
  }
}

export function writeSave(s: PlaySave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 無痕模式等情況存不了，遊戲照樣能玩 */
  }
}
