"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calcCompetitionPoints, getCurrentWeekKey } from "@/lib/competition";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { checkAnswer, type UserAnswer } from "@/lib/practice";
import {
  getCompetitionDailyStatus,
  getCompetitionPuzzleById,
  getUserWeekPoints,
} from "@/lib/supabase/competition";
import { createClient } from "@/lib/supabase/server";

export async function submitCompetitionAnswer(
  puzzleId: string,
  userAnswer: UserAnswer
) {
  const session = await getCurrentUserProfile();
  if (!session) {
    return { error: "請先登入" };
  }

  const { userId, profile } = session;
  const gate = await validateCompetitionSession(userId, profile);
  if ("error" in gate && gate.error) {
    return { error: gate.error };
  }

  const puzzle = await getCompetitionPuzzleById(puzzleId);
  if (!puzzle) {
    return { error: "找不到積分賽題目" };
  }

  const isCorrect = checkAnswer(puzzle, userAnswer);
  const points = calcCompetitionPoints(isCorrect, puzzle.difficulty);

  try {
    const weekKey = await recordCompetitionAttempt(
      userId,
      puzzleId,
      isCorrect,
      points
    );
    const updatedDaily = await getCompetitionDailyStatus(userId);
    const weekPoints = await getUserWeekPoints(userId, weekKey);

    return {
      success: true,
      isCorrect,
      explanation: puzzle.explanation,
      daily: updatedDaily,
      competition: {
        pointsGained: points,
        weekPoints,
        weekKey,
        timedOut: false,
      },
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "提交失敗",
    };
  }
}

async function recordCompetitionAttempt(
  userId: string,
  puzzleId: string,
  isCorrect: boolean,
  points: number
) {
  const weekKey = getCurrentWeekKey();
  const supabase = await createClient();
  const { error } = await supabase.from("competition_attempts").insert({
    user_id: userId,
    puzzle_id: puzzleId,
    week_key: weekKey,
    is_correct: isCorrect,
    points_earned: points,
  });

  if (error) {
    throw new Error(`儲存作答失敗：${error.message}`);
  }

  return weekKey;
}

async function validateCompetitionSession(userId: string, profile: { plan: string }) {
  if (profile.plan !== "paid") {
    return { error: "積分賽僅開放付費會員，請先升級。" };
  }

  const daily = await getCompetitionDailyStatus(userId);
  if (daily.reachedLimit) {
    return { error: "今日積分賽題數已用完，明天再來！" };
  }

  return { daily };
}

export async function submitCompetitionTimeout(puzzleId: string) {
  const session = await getCurrentUserProfile();
  if (!session) {
    return { error: "請先登入" };
  }

  const { userId, profile } = session;
  const gate = await validateCompetitionSession(userId, profile);
  if ("error" in gate && gate.error) {
    return { error: gate.error };
  }

  const puzzle = await getCompetitionPuzzleById(puzzleId);
  if (!puzzle) {
    return { error: "找不到積分賽題目" };
  }

  try {
    const weekKey = await recordCompetitionAttempt(userId, puzzleId, false, 0);
    const updatedDaily = await getCompetitionDailyStatus(userId);
    const weekPoints = await getUserWeekPoints(userId, weekKey);

    return {
      success: true,
      isCorrect: false,
      explanation: puzzle.explanation,
      daily: updatedDaily,
      competition: {
        pointsGained: 0,
        weekPoints,
        weekKey,
        timedOut: true,
      },
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "提交失敗",
    };
  }
}

export async function goToNextCompetitionPuzzle() {
  revalidatePath("/competition");
  redirect("/competition");
}
