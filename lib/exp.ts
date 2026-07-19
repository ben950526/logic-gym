import type { PuzzleDifficulty } from "@/types/puzzle";

export const EXP_CORRECT_BASE = 10;
export const EXP_WRONG = 3;

const DIFFICULTY_BONUS: Record<PuzzleDifficulty, number> = {
  easy: 0,
  medium: 5,
  hard: 10,
};

/** EXP needed to advance from `level` to level + 1 */
export function expRequiredForNextLevel(level: number): number {
  return 30 + (level - 1) * 20;
}

export function calcExpGain(
  isCorrect: boolean,
  difficulty: PuzzleDifficulty
): number {
  if (!isCorrect) {
    return EXP_WRONG;
  }
  return EXP_CORRECT_BASE + DIFFICULTY_BONUS[difficulty];
}

export function applyExpGain(level: number, exp: number, gained: number) {
  let newLevel = level;
  let newExp = exp + gained;
  let leveledUp = false;

  while (newExp >= expRequiredForNextLevel(newLevel)) {
    newExp -= expRequiredForNextLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }

  return {
    level: newLevel,
    exp: newExp,
    leveledUp,
    expGained: gained,
  };
}

export interface LevelProgress {
  level: number;
  exp: number;
  expRequired: number;
  expPercent: number;
}

export function getLevelProgress(level: number, exp: number): LevelProgress {
  const expRequired = expRequiredForNextLevel(level);
  const expPercent =
    expRequired > 0 ? Math.min(100, Math.round((exp / expRequired) * 100)) : 0;

  return { level, exp, expRequired, expPercent };
}
