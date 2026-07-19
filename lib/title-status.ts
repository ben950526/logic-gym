import { countCorrectByCategory } from "@/lib/award-category-title";
import {
  getCategoryTitle,
  getTitleProgress,
  isCategoryUnlocked,
} from "@/lib/titles";
import {
  CATEGORY_LABELS,
  PUZZLE_CATEGORIES,
  isActivePuzzleCategory,
} from "@/types/puzzle";
import type { PuzzleCategory } from "@/types/puzzle";

export interface CategoryTitleStatus {
  category: PuzzleCategory;
  label: string;
  title: string;
  correctCount: number;
  required: number;
  remaining: number;
  percent: number;
  unlocked: boolean;
  isActive: boolean;
}

export async function buildCategoryTitleStatuses(
  userId: string,
  unlockedCategories: string[],
  activeTitleCategory: string | null
): Promise<CategoryTitleStatus[]> {
  const counts = await countCorrectByCategory(userId);
  const activeCategory = isActivePuzzleCategory(activeTitleCategory ?? "")
    ? activeTitleCategory
    : null;

  return PUZZLE_CATEGORIES.map((category) => {
    const progress = getTitleProgress(counts[category]);
    return {
      category,
      label: CATEGORY_LABELS[category],
      title: getCategoryTitle(category),
      ...progress,
      unlocked: isCategoryUnlocked(unlockedCategories, category),
      isActive: activeCategory === category,
    };
  });
}

export function getActiveTitleDisplay(
  activeTitleCategory: string | null
): string | null {
  if (!activeTitleCategory || !isActivePuzzleCategory(activeTitleCategory)) {
    return null;
  }
  return getCategoryTitle(activeTitleCategory);
}
