import type { PuzzleCategory } from "@/types/puzzle";

export const CATEGORY_TITLE_UNLOCK_THRESHOLD = 20;

/** Category title names (v1, one per category) */
export const CATEGORY_TITLES: Record<PuzzleCategory, string> = {
  detective: "謎案終結者",
  math: "數學暗殺者",
  pattern: "規律破譯師",
};

export function getCategoryTitle(category: PuzzleCategory): string {
  return CATEGORY_TITLES[category];
}

export function isCategoryUnlocked(
  unlockedCategories: string[],
  category: PuzzleCategory
): boolean {
  return unlockedCategories.includes(category);
}

export function getTitleProgress(correctCount: number) {
  const required = CATEGORY_TITLE_UNLOCK_THRESHOLD;
  const remaining = Math.max(0, required - correctCount);
  const percent =
    required > 0 ? Math.min(100, Math.round((correctCount / required) * 100)) : 0;

  return { correctCount, required, remaining, percent };
}
