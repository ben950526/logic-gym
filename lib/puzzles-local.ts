import { readFile } from "fs/promises";
import path from "path";
import type { GeneratedPuzzleInput, PuzzleRecord } from "@/types/puzzle";

const SAMPLES_PATH = path.join(
  process.cwd(),
  "content",
  "generated",
  "samples.json"
);

export async function loadLocalSamplePuzzles(): Promise<GeneratedPuzzleInput[]> {
  const raw = await readFile(SAMPLES_PATH, "utf-8");
  return JSON.parse(raw) as GeneratedPuzzleInput[];
}

export function toPuzzleRecords(
  puzzles: GeneratedPuzzleInput[],
  status: PuzzleRecord["status"] = "verified"
): PuzzleRecord[] {
  const now = new Date().toISOString();
  return puzzles.map((puzzle, index) => ({
    id: `local-${index + 1}`,
    type: puzzle.type,
    category: puzzle.category,
    difficulty: puzzle.difficulty,
    title: puzzle.title,
    content_json: puzzle.content_json,
    answer_json: puzzle.answer_json,
    explanation: puzzle.explanation,
    status,
    created_at: now,
  }));
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
