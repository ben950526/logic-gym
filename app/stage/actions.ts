"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { checkAnswer, type UserAnswer } from "@/lib/practice";
import {
  getStageById,
  getStageStatus,
  isPlanetUnlocked,
  loadPlanetMap,
} from "@/lib/stages/planet-map";
import { getClearedStageIds, markStageCleared } from "@/lib/stages/progress";
import { getPuzzleById } from "@/lib/supabase/practice-puzzles";
import { createClient } from "@/lib/supabase/server";

export async function submitStageAnswer(
  stageId: string,
  puzzleId: string,
  userAnswer: UserAnswer
) {
  const session = await getCurrentUserProfile();
  if (!session) {
    return { error: "請先登入" };
  }

  const stageInfo = await getStageById(stageId);
  if (!stageInfo) {
    return { error: "找不到關卡" };
  }

  const map = await loadPlanetMap();
  const cleared = await getClearedStageIds(session.userId);
  const planetUnlocked = isPlanetUnlocked(
    stageInfo.planet,
    cleared,
    map.planets
  );
  const status = getStageStatus(
    stageInfo.planet,
    stageInfo.stage,
    cleared,
    planetUnlocked
  );

  if (status === "locked") {
    return { error: "此關尚未解鎖" };
  }

  const puzzle = await getPuzzleById(puzzleId);
  if (!puzzle || puzzle.title !== stageInfo.stage.puzzleTitle) {
    return { error: "關卡題目不符" };
  }

  const isCorrect = checkAnswer(puzzle, userAnswer);

  const supabase = await createClient();
  await supabase.from("puzzle_attempts").insert({
    user_id: session.userId,
    puzzle_id: puzzleId,
    is_correct: isCorrect,
  });

  if (!isCorrect) {
    return {
      success: true,
      isCorrect: false,
      explanation: puzzle.explanation,
      cleared: false,
    };
  }

  const markResult = await markStageCleared(session.userId, stageId);
  if (markResult.error) {
    return { error: markResult.error };
  }

  const nextStage = stageInfo.planet.stages.find(
    (s) => s.order === stageInfo.stage.order + 1
  );

  revalidatePath("/galaxy");
  revalidatePath(`/planet/${stageInfo.planet.slug}`);
  revalidatePath(`/stage/${stageId}`);

  return {
    success: true,
    isCorrect: true,
    explanation: puzzle.explanation,
    cleared: true,
    stageName: stageInfo.stage.name,
    planetSlug: stageInfo.planet.slug,
    nextStageId: nextStage?.id ?? null,
    planetCleared: !nextStage,
  };
}

export async function returnToPlanet(planetSlug: string) {
  redirect(`/planet/${planetSlug}`);
}

export async function returnToGalaxy() {
  redirect("/galaxy");
}
