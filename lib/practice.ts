import type {
  MultipleChoiceAnswer,
  NumericFillAnswer,
  PuzzleAnswer,
  PuzzleRecord,
} from "@/types/puzzle";

export type UserAnswer =
  | { type: "multiple_choice"; selectedIndex: number }
  | { type: "numeric_fill"; value: number };

export function checkAnswer(
  puzzle: PuzzleRecord,
  userAnswer: UserAnswer
): boolean {
  if (puzzle.type !== userAnswer.type) {
    return false;
  }

  const answer = puzzle.answer_json as PuzzleAnswer;

  switch (userAnswer.type) {
    case "multiple_choice": {
      const expected = answer as MultipleChoiceAnswer;
      return userAnswer.selectedIndex === expected.correctIndex;
    }
    case "numeric_fill": {
      const expected = answer as NumericFillAnswer;
      const tolerance = expected.tolerance ?? 0;
      return Math.abs(userAnswer.value - expected.answer) <= tolerance;
    }
    default:
      return false;
  }
}
