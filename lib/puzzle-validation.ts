import { z } from "zod";
import {
  PUZZLE_CATEGORIES,
  PUZZLE_DIFFICULTIES,
  PUZZLE_TYPES,
  type GeneratedPuzzleInput,
} from "@/types/puzzle";

const multipleChoiceContentSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string().min(1)).min(2).max(6),
  hint: z.string().optional(),
});

const multipleChoiceAnswerSchema = z.object({
  correctIndex: z.number().int().min(0),
});

const numericFillContentSchema = z.object({
  question: z.string().min(10),
  unit: z.string().optional(),
  hint: z.string().optional(),
});

const numericFillAnswerSchema = z.object({
  answer: z.number(),
  tolerance: z.number().nonnegative().optional(),
});

const basePuzzleSchema = z.object({
  type: z.enum(PUZZLE_TYPES),
  category: z.enum(PUZZLE_CATEGORIES),
  difficulty: z.enum(PUZZLE_DIFFICULTIES),
  title: z.string().min(4).max(120),
  explanation: z.string().min(20),
  explanationSteps: z.array(z.string().min(5)).min(2).optional(),
});

const multipleChoicePuzzleSchema = basePuzzleSchema.extend({
  type: z.literal("multiple_choice"),
  content_json: multipleChoiceContentSchema,
  answer_json: multipleChoiceAnswerSchema,
});

const numericFillPuzzleSchema = basePuzzleSchema.extend({
  type: z.literal("numeric_fill"),
  content_json: numericFillContentSchema,
  answer_json: numericFillAnswerSchema,
});

export const generatedPuzzleSchema = z.discriminatedUnion("type", [
  multipleChoicePuzzleSchema,
  numericFillPuzzleSchema,
]);

export type GeneratedPuzzleSchema = z.infer<typeof generatedPuzzleSchema>;

export function validateGeneratedPuzzle(
  puzzle: unknown
): { success: true; data: GeneratedPuzzleInput } | { success: false; errors: string[] } {
  const parsed = generatedPuzzleSchema.safeParse(puzzle);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      ),
    };
  }

  const data = parsed.data;
  const logicErrors = validatePuzzleLogic(data);
  if (logicErrors.length > 0) {
    return { success: false, errors: logicErrors };
  }

  return { success: true, data };
}

function validatePuzzleLogic(puzzle: GeneratedPuzzleSchema): string[] {
  const errors: string[] = [];

  if (puzzle.type === "multiple_choice") {
    const { options } = puzzle.content_json;
    const { correctIndex } = puzzle.answer_json;
    if (correctIndex >= options.length) {
      errors.push("correctIndex 超出 options 範圍");
    }
    const uniqueOptions = new Set(options.map((o) => o.trim()));
    if (uniqueOptions.size !== options.length) {
      errors.push("選項不可重複");
    }
  }

  if (puzzle.type === "numeric_fill") {
    if (!Number.isFinite(puzzle.answer_json.answer)) {
      errors.push("填空答案必須是有效數字");
    }
  }

  return errors;
}

export function validatePuzzleBatch(puzzles: unknown[]): {
  valid: GeneratedPuzzleInput[];
  invalid: { index: number; errors: string[] }[];
} {
  const valid: GeneratedPuzzleInput[] = [];
  const invalid: { index: number; errors: string[] }[] = [];

  puzzles.forEach((puzzle, index) => {
    const result = validateGeneratedPuzzle(puzzle);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, errors: result.errors });
    }
  });

  return { valid, invalid };
}
