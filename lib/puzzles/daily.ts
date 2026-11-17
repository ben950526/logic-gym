/** 每日任務、連續天數、寶箱（純函式，方便測試） */
import { randInt, type Rng, defaultRng } from "./random";
import { todayStr, type PlaySave } from "./save";
import { WARDROBE, type WardrobeItem } from "./wardrobe";

export const DAILY_GOAL = 3;
export const CHEST_BONUS_STARS = 2; // 裝扮全部收集完之後，寶箱改給星星

function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

/** 換日：日期不一樣就把今天的任務歸零 */
export function rollDay(s: PlaySave, today = todayStr()): PlaySave {
  if (s.daily.date === today) return s;
  return { ...s, daily: { date: today, done: 0, opened: false } };
}

/** 目前顯示的連續天數（昨天或今天有完成才算數，斷掉就歸零） */
export function currentStreak(s: PlaySave, today = todayStr()): number {
  if (!s.lastDoneDate) return 0;
  return daysBetween(s.lastDoneDate, today) <= 1 ? s.streak : 0;
}

/** 解開一題時呼叫：累計今日任務，剛好達標時更新連續天數 */
export function recordSolve(s: PlaySave, today = todayStr()): { save: PlaySave; justCompleted: boolean } {
  const rolled = rollDay(s, today);
  const done = rolled.daily.done + 1;
  const justCompleted = done === DAILY_GOAL;
  let { streak, lastDoneDate } = rolled;
  if (justCompleted) {
    streak = lastDoneDate && daysBetween(lastDoneDate, today) === 1 ? streak + 1 : lastDoneDate === today ? streak : 1;
    lastDoneDate = today;
  }
  return { save: { ...rolled, daily: { ...rolled.daily, done }, streak, lastDoneDate }, justCompleted };
}

export function canOpenChest(s: PlaySave, today = todayStr()): boolean {
  return s.daily.date === today && s.daily.done >= DAILY_GOAL && !s.daily.opened;
}

/** 寶箱獎勵：隨機給一件還沒有的裝扮（自動穿上）；全部都有了就給星星 */
export function grantReward(s: PlaySave, rng: Rng = defaultRng): { save: PlaySave; item: WardrobeItem | null } {
  const missing = WARDROBE.filter((w) => !s.items.includes(w.id));
  if (!missing.length) return { save: { ...s, stars: s.stars + CHEST_BONUS_STARS }, item: null };
  const item = missing[randInt(missing.length, rng)];
  return { save: { ...s, items: [...s.items, item.id], look: { ...s.look, [item.slot]: item.id } }, item };
}

/** 開每日寶箱（一天一次） */
export function openChest(s: PlaySave, rng: Rng = defaultRng): { save: PlaySave; item: WardrobeItem | null } {
  const r = grantReward(s, rng);
  return { save: { ...r.save, daily: { ...s.daily, opened: true } }, item: r.item };
}
