import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import {
  CATEGORY_TITLE_UNLOCK_THRESHOLD,
  getCategoryTitle,
  isCategoryUnlocked,
} from "@/lib/titles";
import { PUZZLE_CATEGORIES, type PuzzleCategory } from "@/types/puzzle";

export async function countCorrectByCategory(
  userId: string
): Promise<Record<PuzzleCategory, number>> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("puzzle_attempts")
    .select("puzzles!inner(category)")
    .eq("user_id", userId)
    .eq("is_correct", true);

  if (error) {
    throw new Error(`讀取類別答對數失敗：${error.message}`);
  }

  const counts = Object.fromEntries(
    PUZZLE_CATEGORIES.map((cat) => [cat, 0])
  ) as Record<PuzzleCategory, number>;

  for (const row of data ?? []) {
    const puzzles = row.puzzles as
      | { category: PuzzleCategory }
      | { category: PuzzleCategory }[]
      | null;
    const puzzle = Array.isArray(puzzles) ? puzzles[0] : puzzles;
    const cat = puzzle?.category;
    if (cat && cat in counts) {
      counts[cat] += 1;
    }
  }

  return counts;
}

export interface CategoryTitleAwardResult {
  titleUnlocked: boolean;
  unlockedCategory?: PuzzleCategory;
  titleName?: string;
  correctCount: number;
  required: number;
  unlockedCategories: string[];
  activeTitleCategory: string | null;
}

export async function awardCategoryTitleIfEligible(
  userId: string,
  category: PuzzleCategory,
  unlockedCategories: string[],
  activeTitleCategory: string | null
): Promise<CategoryTitleAwardResult> {
  const counts = await countCorrectByCategory(userId);
  const correctCount = counts[category];
  const alreadyUnlocked = isCategoryUnlocked(unlockedCategories, category);

  if (
    alreadyUnlocked ||
    correctCount < CATEGORY_TITLE_UNLOCK_THRESHOLD
  ) {
    return {
      titleUnlocked: false,
      correctCount,
      required: CATEGORY_TITLE_UNLOCK_THRESHOLD,
      unlockedCategories,
      activeTitleCategory,
    };
  }

  const nextUnlocked = [...unlockedCategories, category];
  const nextActive = activeTitleCategory ?? category;
  const titleName = getCategoryTitle(category);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      unlocked_title_categories: nextUnlocked,
      active_title_category: nextActive,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`更新封號失敗：${error.message}`);
  }

  return {
    titleUnlocked: true,
    unlockedCategory: category,
    titleName,
    correctCount,
    required: CATEGORY_TITLE_UNLOCK_THRESHOLD,
    unlockedCategories: nextUnlocked,
    activeTitleCategory: nextActive,
  };
}

export async function setActiveTitleCategory(
  userId: string,
  category: PuzzleCategory,
  unlockedCategories: string[]
) {
  if (!isCategoryUnlocked(unlockedCategories, category)) {
    throw new Error("尚未解鎖此封號");
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ active_title_category: category })
    .eq("id", userId);

  if (error) {
    throw new Error(`切換封號失敗：${error.message}`);
  }
}
