#!/usr/bin/env tsx
/**
 * 將已審核 JSON 題目匯入 Supabase
 *
 * 用法：
 *   npm run seed:puzzles
 *   npm run seed:puzzles -- --file content/generated/samples.json
 *   npm run seed:puzzles -- --replace
 */

import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { createSupabaseAdmin } from "../lib/supabase/puzzles";
import { validatePuzzleBatch } from "../lib/puzzle-validation";
import type { GeneratedPuzzleInput, PuzzleStatus } from "../types/puzzle";

config({ path: ".env.local" });
config();

interface SeedOptions {
  file: string;
  status: PuzzleStatus;
  dryRun: boolean;
  replace: boolean;
}

function parseArgs(argv: string[]): SeedOptions {
  const options: SeedOptions = {
    file: path.join("content", "generated", "samples.json"),
    status: "verified",
    dryRun: false,
    replace: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--file") options.file = argv[++i];
    if (arg === "--status") options.status = argv[++i] as PuzzleStatus;
    if (arg === "--dry-run") options.dryRun = true;
    if (arg === "--replace") options.replace = true;
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(process.cwd(), options.file);
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown[];
  const { valid, invalid } = validatePuzzleBatch(parsed);

  console.log(`讀取：${filePath}`);
  console.log(`有效 ${valid.length} 題 / 無效 ${invalid.length} 題`);

  if (invalid.length > 0) {
    invalid.forEach(({ index, errors }) => {
      console.error(`  [#${index}] ${errors.join("; ")}`);
    });
    process.exit(1);
  }

  if (options.dryRun) {
    console.log("dry-run 完成，未寫入資料庫。");
    return;
  }

  const supabase = createSupabaseAdmin();

  if (options.replace) {
    const { error: deleteError } = await supabase
      .from("puzzles")
      .delete()
      .gte("created_at", "1970-01-01T00:00:00Z");

    if (deleteError) {
      throw new Error(`清除舊題目失敗：${deleteError.message}`);
    }
    console.log("✓ 已清除舊題目（含作答紀錄一併移除）");
  }

  const rows = valid.map((puzzle: GeneratedPuzzleInput) => ({
    type: puzzle.type,
    category: puzzle.category,
    difficulty: puzzle.difficulty,
    title: puzzle.title,
    content_json: puzzle.content_json,
    answer_json: puzzle.answer_json,
    explanation: puzzle.explanation,
    status: options.status,
  }));

  const { data, error } = await supabase
    .from("puzzles")
    .insert(rows)
    .select("id, title, status");

  if (error) {
    throw new Error(`匯入失敗：${error.message}`);
  }

  console.log(`✓ 成功匯入 ${data?.length ?? 0} 題（status=${options.status}）`);
  data?.forEach((row) => {
    console.log(`  - ${row.title} (${row.id})`);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
