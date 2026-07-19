#!/usr/bin/env tsx
/**
 * 確保數學星球 100 關題目全部在 Supabase 且 status=verified
 * Run: npx tsx scripts/verify-math-100-stages.ts
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { createSupabaseAdmin } from "../lib/supabase/puzzles";
import type { GeneratedPuzzleInput } from "../types/puzzle";

config({ path: ".env.local" });

async function main() {
  const root = process.cwd();
  const map = JSON.parse(
    await readFile(path.join(root, "content/stages/planet-map-v1.json"), "utf-8")
  ) as {
    planets: Array<{ id: string; stages: Array<{ puzzleTitle: string }> }>;
  };
  const library = JSON.parse(
    await readFile(path.join(root, "content/generated/library.json"), "utf-8")
  ) as GeneratedPuzzleInput[];

  const titles = map.planets
    .find((p) => p.id === "math-planet")!
    .stages.map((s) => s.puzzleTitle);

  if (titles.length !== 100) {
    throw new Error(`預期 100 關，目前 ${titles.length} 關`);
  }

  const byTitle = new Map(library.filter((p) => p.category === "math").map((p) => [p.title, p]));
  const supabase = createSupabaseAdmin();

  const { data: existing, error: readError } = await supabase
    .from("puzzles")
    .select("id, title, status")
    .eq("category", "math");

  if (readError) throw readError;

  const inDb = new Map(existing?.map((r) => [r.title, r]) ?? []);
  const missing = titles.filter((t) => !inDb.has(t));

  if (missing.length > 0) {
    const rows = missing.map((title) => {
      const puzzle = byTitle.get(title);
      if (!puzzle) throw new Error(`library.json 缺少題目：${title}`);
      return {
        type: puzzle.type,
        category: puzzle.category,
        difficulty: puzzle.difficulty,
        title: puzzle.title,
        content_json: puzzle.content_json,
        answer_json: puzzle.answer_json,
        explanation: puzzle.explanation,
        status: "verified" as const,
      };
    });

    const { data: inserted, error: insertError } = await supabase
      .from("puzzles")
      .insert(rows)
      .select("title");

    if (insertError) throw insertError;
    console.log(`✓ 補匯入 ${inserted?.length ?? 0} 題（直接 verified）`);
    inserted?.forEach((r) => console.log(`  + ${r.title}`));
  } else {
    console.log("✓ 100 題皆已在資料庫");
  }

  const { data: updated, error: updateError } = await supabase
    .from("puzzles")
    .update({ status: "verified" })
    .eq("category", "math")
    .in("title", titles)
    .select("title, status");

  if (updateError) throw updateError;

  const verifiedSet = new Set(updated?.map((r) => r.title));
  const stillMissing = titles.filter((t) => !verifiedSet.has(t));

  if (stillMissing.length > 0) {
    console.error("⚠ 以下題目仍無法上架：");
    stillMissing.forEach((t) => console.error(`  - ${t}`));
    process.exit(1);
  }

  console.log(`\n✓ 數學星球 100 關全部已上架（verified）`);
  console.log(`  共 ${updated?.length ?? 0} 題`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
