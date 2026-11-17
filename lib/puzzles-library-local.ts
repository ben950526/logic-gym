import { readFile } from "fs/promises";
import path from "path";
import type { PuzzleRecord } from "@/types/puzzle";

const LIBRARY_PATHS = [
  path.join(process.cwd(), "content", "generated", "library.json"),
  path.join(process.cwd(), "content", "generated", "kindergarten-logic-k.json"),
  path.join(process.cwd(), "content", "generated", "kindergarten-logic-k-pilot-5.json"),
  path.join(process.cwd(), "content", "generated", "kindergarten-logic-k-batch-2.json"),
];

let cachedByTitle: Map<string, PuzzleRecord> | null = null;

async function loadLibraryByTitle(): Promise<Map<string, PuzzleRecord>> {
  if (cachedByTitle) return cachedByTitle;

  const map = new Map<string, PuzzleRecord>();
  for (const filePath of LIBRARY_PATHS) {
    try {
      const raw = await readFile(filePath, "utf-8");
      const items = JSON.parse(raw) as Array<Record<string, unknown>>;
      for (const item of items) {
        const title = item.title as string;
        if (!title || map.has(title)) continue;
        map.set(title, {
          id: `local-${Buffer.from(title).toString("base64url").slice(0, 22)}`,
          type: item.type as PuzzleRecord["type"],
          category: item.category as PuzzleRecord["category"],
          difficulty: item.difficulty as PuzzleRecord["difficulty"],
          title,
          content_json: item.content_json as PuzzleRecord["content_json"],
          answer_json: item.answer_json as PuzzleRecord["answer_json"],
          explanation: item.explanation as string,
          status: "verified",
          created_at: new Date(0).toISOString(),
        });
      }
    } catch {
      // optional file
    }
  }

  cachedByTitle = map;
  return map;
}

/** Supabase 找不到時，從本地 JSON 讀題（顯示用；作答仍需 seed 進 DB） */
export async function getLocalPuzzleByTitle(
  title: string
): Promise<PuzzleRecord | null> {
  const map = await loadLibraryByTitle();
  return map.get(title) ?? null;
}
