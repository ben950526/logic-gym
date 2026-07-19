export const PUZZLE_TYPES = ["multiple_choice", "numeric_fill"] as const;
export type PuzzleType = (typeof PUZZLE_TYPES)[number];

export const PUZZLE_CATEGORIES = ["detective", "math", "pattern"] as const;
export type PuzzleCategory = (typeof PUZZLE_CATEGORIES)[number];

export const PUZZLE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type PuzzleDifficulty = (typeof PUZZLE_DIFFICULTIES)[number];

export const PUZZLE_STATUSES = ["pending", "verified", "rejected"] as const;
export type PuzzleStatus = (typeof PUZZLE_STATUSES)[number];

export interface MultipleChoiceContent {
  question: string;
  options: string[];
  hint?: string;
}

export interface MultipleChoiceAnswer {
  correctIndex: number;
}

export interface NumericFillContent {
  question: string;
  unit?: string;
  hint?: string;
}

export interface NumericFillAnswer {
  answer: number;
  tolerance?: number;
}

export type PuzzleContent = MultipleChoiceContent | NumericFillContent;

export type PuzzleAnswer = MultipleChoiceAnswer | NumericFillAnswer;

export interface PuzzleRecord {
  id: string;
  type: PuzzleType;
  category: PuzzleCategory;
  difficulty: PuzzleDifficulty;
  title: string;
  content_json: PuzzleContent;
  answer_json: PuzzleAnswer;
  explanation: string;
  status: PuzzleStatus;
  in_competition_pool?: boolean;
  created_at: string;
}

export interface GeneratedPuzzleInput {
  type: PuzzleType;
  category: PuzzleCategory;
  difficulty: PuzzleDifficulty;
  title: string;
  content_json: PuzzleContent;
  answer_json: PuzzleAnswer;
  explanation: string;
  explanationSteps?: string[];
}

export const CATEGORY_LABELS: Record<PuzzleCategory, string> = {
  detective: "偵探推理",
  math: "數學推理",
  pattern: "找規律",
};

export const TYPE_LABELS: Record<PuzzleType, string> = {
  multiple_choice: "選擇題",
  numeric_fill: "數字填空",
};

export const DIFFICULTY_LABELS: Record<PuzzleDifficulty, string> = {
  easy: "簡單",
  medium: "中等",
  hard: "困難",
};

export const STATUS_LABELS: Record<PuzzleStatus, string> = {
  pending: "待審",
  verified: "已上架",
  rejected: "已拒絕",
};

export function isActivePuzzleCategory(
  category: string
): category is PuzzleCategory {
  return (PUZZLE_CATEGORIES as readonly string[]).includes(category);
}
