#!/usr/bin/env tsx
/**
 * 驗證 JSON 題目格式（Cursor 出題後使用，不寫入資料庫）
 *
 * 用法：
 *   npm run validate:puzzles -- --file content/generated/my-batch.json
 */

import { readFile } from "fs/promises";
import path from "path";
import { validatePuzzleBatch } from "../lib/puzzle-validation";

function parseArgs(argv: string[]): { file: string } {
  let file = path.join("content", "generated", "samples.json");
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--file") file = argv[++i];
  }
  return { file };
}

async function main() {
  const { file } = parseArgs(process.argv.slice(2));
  const filePath = path.resolve(process.cwd(), file);
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown[];
  const { valid, invalid } = validatePuzzleBatch(parsed);

  console.log(`檔案：${filePath}`);
  console.log(`有效 ${valid.length} 題 / 無效 ${invalid.length} 題`);

  if (invalid.length > 0) {
    invalid.forEach(({ index, errors }) => {
      console.error(`  [#${index}] ${errors.join("; ")}`);
    });
    process.exit(1);
  }

  console.log("✓ 全部通過格式驗證，可匯入（建議先人工審題）");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
