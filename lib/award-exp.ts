import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import { applyExpGain, calcExpGain } from "@/lib/exp";
import type { PuzzleDifficulty } from "@/types/puzzle";

export async function awardPracticeExp(
  userId: string,
  currentLevel: number,
  currentExp: number,
  isCorrect: boolean,
  difficulty: PuzzleDifficulty
) {
  const gained = calcExpGain(isCorrect, difficulty);
  const next = applyExpGain(currentLevel, currentExp, gained);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ level: next.level, exp: next.exp })
    .eq("id", userId);

  if (error) {
    throw new Error(`更新 EXP 失敗：${error.message}`);
  }

  return next;
}
