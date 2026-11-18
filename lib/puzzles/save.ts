/** 玩家進度（訪客先存在這台裝置；之後登入再同步到 Supabase） */
export type GameKind = "nono" | "stroke" | "sudoku";

export interface PlaySave {
  solved: Record<GameKind, number>;
  stars: number; // 樹喝到的水滴數（= 成長值）
  dex: string[]; // 拼過的數織圖案（下一題就換新圖案）
  muted: boolean;
  seenDemo: GameKind[]; // 看過示範的謎題
  adv: number; // 冒險路線圖已經走過幾個點
}

const KEY = "logic-gym-play-v1";

export const emptySave = (): PlaySave => ({
  solved: { nono: 0, stroke: 0, sudoku: 0 },
  stars: 0,
  dex: [],
  muted: false,
  seenDemo: [],
  adv: 0,
});

export function loadSave(): PlaySave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const s = JSON.parse(raw) as Partial<PlaySave>;
    const base = emptySave();
    // 只取現在還在用的欄位（舊版的花園、每日任務、衣服等資料直接丟掉）
    return {
      solved: { ...base.solved, ...(s.solved ?? {}) },
      stars: typeof s.stars === "number" && s.stars >= 0 ? s.stars : 0,
      dex: Array.isArray(s.dex) ? s.dex : [],
      muted: !!s.muted,
      seenDemo: Array.isArray(s.seenDemo) ? s.seenDemo : [],
      adv: typeof s.adv === "number" && s.adv >= 0 ? s.adv : 0,
    };
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
