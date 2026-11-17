/** 玩家進度（訪客先存在這台裝置；之後登入再同步到 Supabase） */
import type { Look } from "./wardrobe";

export type GameKind = "nono" | "stroke" | "sudoku";

export interface DailyState {
  date: string; // YYYY-MM-DD（使用者當地日期）
  done: number; // 今天解了幾題
  opened: boolean; // 今天的寶箱開了沒
}

export interface PlaySave {
  solved: Record<GameKind, number>;
  stars: number;
  dex: string[]; // 已收集的圖鑑名稱
  muted: boolean;
  daily: DailyState;
  streak: number; // 連續完成每日任務的天數
  lastDoneDate: string | null; // 上次完成每日任務的日期
  items: string[]; // 已擁有的裝扮
  look: Look; // 目前穿戴
  seenDemo: GameKind[]; // 看過示範的謎題
}

const KEY = "logic-gym-play-v1";

export function todayStr(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const emptySave = (): PlaySave => ({
  solved: { nono: 0, stroke: 0, sudoku: 0 },
  stars: 0,
  dex: [],
  muted: false,
  daily: { date: todayStr(), done: 0, opened: false },
  streak: 0,
  lastDoneDate: null,
  items: [],
  look: {},
  seenDemo: [],
});

export function loadSave(): PlaySave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const s = JSON.parse(raw) as Partial<PlaySave>;
    const base = emptySave();
    return {
      ...base,
      ...s,
      solved: { ...base.solved, ...(s.solved ?? {}) },
      dex: Array.isArray(s.dex) ? s.dex : [],
      items: Array.isArray(s.items) ? s.items : [],
      seenDemo: Array.isArray(s.seenDemo) ? s.seenDemo : [],
      look: s.look ?? {},
      daily: s.daily ?? base.daily,
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
