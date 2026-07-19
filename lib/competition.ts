import type { PuzzleDifficulty } from "@/types/puzzle";

export const COMPETITION_DAILY_LIMIT = 10;

/** Seconds per question in competition mode */
export const COMPETITION_TIME_LIMITS: Record<PuzzleDifficulty, number> = {
  easy: 60,
  medium: 90,
  hard: 120,
};

export function competitionTimeLimitSeconds(
  difficulty: PuzzleDifficulty
): number {
  return COMPETITION_TIME_LIMITS[difficulty];
}

const POINTS_BASE = 100;
const POINTS_DIFFICULTY: Record<PuzzleDifficulty, number> = {
  easy: 0,
  medium: 25,
  hard: 50,
};

export function calcCompetitionPoints(
  isCorrect: boolean,
  difficulty: PuzzleDifficulty
): number {
  if (!isCorrect) return 0;
  return POINTS_BASE + POINTS_DIFFICULTY[difficulty];
}

/** ISO week key in Asia/Taipei, e.g. 2026-W26 */
export function getCurrentWeekKey(now = new Date()): string {
  const taipeiDate = getTaipeiDateParts(now);
  const utc = new Date(
    Date.UTC(taipeiDate.year, taipeiDate.month - 1, taipeiDate.day)
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getTaipeiDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return { year: get("year"), month: get("month"), day: get("day") };
}

export function getWeekLabel(weekKey: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!match) return weekKey;
  return `${match[1]} 第 ${Number(match[2])} 週`;
}

export function startOfTodayTaipeiUtc(): string {
  const { year, month, day } = getTaipeiDateParts(new Date());
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}
