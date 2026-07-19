import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import { createClient } from "@/lib/supabase/server";
import { PUZZLE_CATEGORIES, type PuzzleRecord } from "@/types/puzzle";

function isPlayablePuzzle(puzzle: PuzzleRecord): boolean {
  return (PUZZLE_CATEGORIES as readonly string[]).includes(puzzle.category);
}

export async function listPuzzlesForAdmin(): Promise<PuzzleRecord[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`讀取題目失敗：${error.message}`);
  }

  return (data ?? []) as PuzzleRecord[];
}

export async function pickPracticePuzzle(
  userId: string
): Promise<PuzzleRecord | null> {
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data: attempts, error: attemptsError } = await supabase
    .from("puzzle_attempts")
    .select("puzzle_id")
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (attemptsError) {
    throw new Error(`讀取作答紀錄失敗：${attemptsError.message}`);
  }

  const attemptedIds = new Set(
    (attempts ?? []).map((row) => row.puzzle_id as string)
  );

  const { data: puzzles, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("status", "verified");

  if (error) {
    throw new Error(`讀取題目失敗：${error.message}`);
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

export async function getPuzzleById(id: string): Promise<PuzzleRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", id)
    .eq("status", "verified")
    .single();

  if (error) {
    return null;
  }

  return data as PuzzleRecord;
}

export async function getPuzzleByTitle(title: string): Promise<PuzzleRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("title", title)
    .eq("status", "verified")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PuzzleRecord;
}
