"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkAnswer, type UserAnswer } from "@/lib/practice";
import {
  getCurrentUserProfile,
  getDailyPracticeStatus,
} from "@/lib/daily-limit";
import { getPuzzleById } from "@/lib/supabase/practice-puzzles";
import { createClient } from "@/lib/supabase/server";
import { awardPracticeExp } from "@/lib/award-exp";
import { awardCategoryTitleIfEligible, setActiveTitleCategory } from "@/lib/award-category-title";
import { getLevelProgress } from "@/lib/exp";
import { getCategoryTitle, getTitleProgress } from "@/lib/titles";

export async function submitAnswer(puzzleId: string, userAnswer: UserAnswer) {
  const session = await getCurrentUserProfile();
  if (!session) {
    return { error: "請先登入" };
  }

  const { userId, profile } = session;
  const daily = await getDailyPracticeStatus(userId, profile.plan);

  if (daily.reachedLimit) {
    return { error: "今日題數已用完，明天再來吧！" };
  }

  const puzzle = await getPuzzleById(puzzleId);
  if (!puzzle) {
    return { error: "找不到題目" };
  }

  const isCorrect = checkAnswer(puzzle, userAnswer);
  const supabase = await createClient();

  const { error } = await supabase.from("puzzle_attempts").insert({
    user_id: userId,
    puzzle_id: puzzleId,
    is_correct: isCorrect,
  });

  if (error) {
    return { error: `儲存作答失敗：${error.message}` };
  }

  let expResult;
  try {
    expResult = await awardPracticeExp(
      userId,
      profile.level ?? 1,
      profile.exp ?? 0,
      isCorrect,
      puzzle.difficulty
    );
  } catch (expError) {
    return {
      error:
        expError instanceof Error ? expError.message : "更新 EXP 失敗",
    };
  }

  let titlePayload: {
    unlocked: boolean;
    name: string | null;
    category: typeof puzzle.category;
    progress: ReturnType<typeof getTitleProgress> | null;
    activeTitle: string | null;
  } | null = null;

  if (isCorrect) {
    try {
      const titleResult = await awardCategoryTitleIfEligible(
        userId,
        puzzle.category,
        profile.unlocked_title_categories ?? [],
        profile.active_title_category ?? null
      );
      const activeCategory =
        titleResult.activeTitleCategory ?? profile.active_title_category;
      titlePayload = {
        unlocked: titleResult.titleUnlocked,
        name: titleResult.titleName ?? null,
        category: titleResult.unlockedCategory ?? puzzle.category,
        progress: getTitleProgress(titleResult.correctCount),
        activeTitle:
          activeCategory != null
            ? getCategoryTitle(activeCategory as typeof puzzle.category)
            : null,
      };
    } catch {
      titlePayload = {
        unlocked: false,
        name: null,
        category: puzzle.category,
        progress: null,
        activeTitle: null,
      };
    }
  }

  const updatedDaily = await getDailyPracticeStatus(userId, profile.plan);

  return {
    success: true,
    isCorrect,
    explanation: puzzle.explanation,
    daily: updatedDaily,
    exp: {
      gained: expResult.expGained,
      leveledUp: expResult.leveledUp,
      level: expResult.level,
      progress: getLevelProgress(expResult.level, expResult.exp),
    },
    title: titlePayload,
  };
}

export async function goToNextPuzzle() {
  revalidatePath("/practice");
  redirect("/practice");
}

export async function setActiveTitle(category: string) {
  const session = await getCurrentUserProfile();
  if (!session) {
    return { error: "請先登入" };
  }

  const { userId, profile } = session;
  const validCategories = ["detective", "math", "pattern"] as const;
  if (!validCategories.includes(category as (typeof validCategories)[number])) {
    return { error: "無效的封號類別" };
  }

  try {
    await setActiveTitleCategory(
      userId,
      category as (typeof validCategories)[number],
      profile.unlocked_title_categories ?? []
    );
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "切換封號失敗",
    };
  }

  revalidatePath("/practice");
  return { success: true };
}
