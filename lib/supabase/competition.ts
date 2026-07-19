import {
  COMPETITION_DAILY_LIMIT,
  getCurrentWeekKey,
  startOfTodayTaipeiUtc,
} from "@/lib/competition";
import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import { createClient } from "@/lib/supabase/server";
import { PUZZLE_CATEGORIES, type PuzzleRecord } from "@/types/puzzle";

function isPlayablePuzzle(puzzle: PuzzleRecord): boolean {
  return (PUZZLE_CATEGORIES as readonly string[]).includes(puzzle.category);
}

export async function getCompetitionDailyStatus(userId: string) {
  const supabase = await createClient();
  const weekKey = getCurrentWeekKey();

  const { count, error } = await supabase
    .from("competition_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .gte("created_at", startOfTodayTaipeiUtc());

  if (error) {
    throw new Error(`讀取積分賽題數失敗：${error.message}`);
  }

  const used = count ?? 0;
  return {
    used,
    limit: COMPETITION_DAILY_LIMIT,
    remaining: Math.max(0, COMPETITION_DAILY_LIMIT - used),
    reachedLimit: used >= COMPETITION_DAILY_LIMIT,
    weekKey,
  };
}

export async function getUserWeekPoints(
  userId: string,
  weekKey?: string
): Promise<number> {
  const supabase = await createClient();
  const key = weekKey ?? getCurrentWeekKey();

  const { data, error } = await supabase
    .from("competition_attempts")
    .select("points_earned")
    .eq("user_id", userId)
    .eq("week_key", key);

  if (error) {
    throw new Error(`讀取本週積分失敗：${error.message}`);
  }

  return (data ?? []).reduce(
    (sum, row) => sum + (row.points_earned as number),
    0
  );
}

export async function pickCompetitionPuzzle(
  userId: string
): Promise<PuzzleRecord | null> {
  const supabase = await createClient();
  const weekKey = getCurrentWeekKey();

  const { data: attempts, error: attemptsError } = await supabase
    .from("competition_attempts")
    .select("puzzle_id")
    .eq("user_id", userId)
    .eq("week_key", weekKey);

  if (attemptsError) {
    throw new Error(`讀取積分賽紀錄失敗：${attemptsError.message}`);
  }

  const attemptedIds = new Set(
    (attempts ?? []).map((row) => row.puzzle_id as string)
  );

  const { data: puzzles, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("status", "verified")
    .eq("in_competition_pool", true);

  if (error) {
    throw new Error(`讀取積分賽題庫失敗：${error.message}`);
  }

  const pool = ((puzzles ?? []) as PuzzleRecord[])
    .filter(isPlayablePuzzle)
    .filter((puzzle) => !attemptedIds.has(puzzle.id));

  const candidates =
    pool.length > 0
      ? pool
      : ((puzzles ?? []) as PuzzleRecord[]).filter(isPlayablePuzzle);

  if (candidates.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

export async function getCompetitionPuzzleById(
  id: string
): Promise<PuzzleRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", id)
    .eq("status", "verified")
    .eq("in_competition_pool", true)
    .single();

  if (error) {
    return null;
  }

  return data as PuzzleRecord;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  points: number;
  isCurrentUser: boolean;
}

export async function getWeeklyLeaderboard(
  userId: string,
  weekKey?: string,
  limit = 20
): Promise<{ weekKey: string; entries: LeaderboardEntry[]; myRank: number | null; myPoints: number }> {
  const key = weekKey ?? getCurrentWeekKey();
  const supabase = createSupabaseAdmin();

  const { data: attempts, error } = await supabase
    .from("competition_attempts")
    .select("user_id, points_earned")
    .eq("week_key", key);

  if (error) {
    throw new Error(`讀取排行榜失敗：${error.message}`);
  }

  const totals = new Map<string, number>();
  for (const row of attempts ?? []) {
    const uid = row.user_id as string;
    totals.set(uid, (totals.get(uid) ?? 0) + (row.points_earned as number));
  }

  const sorted = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const userIds = sorted.map(([id]) => id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const nicknames = new Map(
    (profiles ?? []).map((p) => [p.id as string, p.nickname as string])
  );

  const myPoints = totals.get(userId) ?? 0;
  const allSorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const myRankIndex = allSorted.findIndex(([id]) => id === userId);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

  const entries: LeaderboardEntry[] = sorted.map(([id, points], index) => ({
    rank: index + 1,
    nickname: nicknames.get(id) ?? "學員",
    points,
    isCurrentUser: id === userId,
  }));

  return { weekKey: key, entries, myRank, myPoints };
}
