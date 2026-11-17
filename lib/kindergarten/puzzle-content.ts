import type { MultipleChoiceContent, PuzzleContent, PuzzleRecord } from "@/types/puzzle";

export const KINDERGARTEN_PLANET_SLUG = "pattern-k";

type KindergartenContent = MultipleChoiceContent & {
  kindergarten?: boolean;
  visualPrompt?: string;
  parentReadAloud?: string;
};

export function isKindergartenPlanetSlug(slug: string): boolean {
  return slug === KINDERGARTEN_PLANET_SLUG;
}

export function isKindergartenStageId(stageId: string): boolean {
  return stageId.startsWith("pattern-k-");
}

export function isKindergartenPuzzle(puzzle: PuzzleRecord): boolean {
  const content = puzzle.content_json as PuzzleContent & {
    kindergarten?: boolean;
  };
  return content.kindergarten === true;
}

export function isKindergartenStageContext(
  planetSlug: string,
  stageId: string,
  puzzle?: PuzzleRecord
): boolean {
  return (
    isKindergartenPlanetSlug(planetSlug) ||
    isKindergartenStageId(stageId) ||
    (puzzle ? isKindergartenPuzzle(puzzle) : false)
  );
}

/** DB 缺欄位時，用本地 JSON 補齊幼兒視覺題內容 */
export function mergeKindergartenContent(
  primary: PuzzleRecord,
  fallback: PuzzleRecord
): PuzzleRecord {
  const primaryContent = primary.content_json as KindergartenContent;
  const fallbackContent = fallback.content_json as KindergartenContent;

  const hasVisual =
    typeof primaryContent.visualPrompt === "string" &&
    primaryContent.visualPrompt.trim().length > 0;

  if (primaryContent.kindergarten === true && hasVisual) {
    return primary;
  }

  const primaryQ = primaryContent.question?.trim() ?? "";
  const fallbackQ = fallbackContent.question?.trim() ?? "";
  const useFallbackQuestion =
    fallbackQ.length > 0 &&
    (primaryQ.startsWith("（幼兒視覺題") || !primaryQ);

  return {
    ...primary,
    content_json: {
      ...primaryContent,
      kindergarten: fallbackContent.kindergarten ?? primaryContent.kindergarten ?? true,
      visualPrompt: fallbackContent.visualPrompt ?? primaryContent.visualPrompt,
      question: useFallbackQuestion ? fallbackContent.question : primaryContent.question,
      parentReadAloud:
        fallbackContent.parentReadAloud ?? primaryContent.parentReadAloud,
      options: fallbackContent.options ?? primaryContent.options,
      hint: fallbackContent.hint ?? primaryContent.hint,
    },
  };
}

export function getKindergartenQuestionText(
  content: KindergartenContent
): string | null {
  const raw = content.question?.trim();
  if (!raw) return null;
  return raw.replace(/^（[^）]*）\s*/, "").trim() || raw;
}

export function getKindergartenDisplay(content: KindergartenContent): {
  visualPrompt: string | null;
  readAloud: string | null;
} {
  const visualPrompt = content.visualPrompt?.trim() || null;
  const readAloud =
    getKindergartenQuestionText(content) ||
    content.parentReadAloud?.trim() ||
    null;

  return { visualPrompt, readAloud };
}

export function getKindergartenBackHref(planetSlug: string): string {
  if (isKindergartenPlanetSlug(planetSlug)) {
    return "/universe/kindergarten/galaxy/logic";
  }
  return `/planet/${planetSlug}`;
}
