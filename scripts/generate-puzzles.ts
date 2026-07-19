#!/usr/bin/env tsx
/**
 * 離線 AI 批次出題腳本
 *
 * 用法範例：
 *   npm run generate:puzzles -- --template detective-multiple-choice --difficulty easy --count 5
 *   npm run generate:puzzles -- --all-samples
 */

import { config } from "dotenv";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { validatePuzzleBatch } from "../lib/puzzle-validation";
import type { GeneratedPuzzleInput, PuzzleDifficulty } from "../types/puzzle";

config({ path: ".env.local" });
config();

interface GenerateOptions {
  template?: string;
  difficulty: PuzzleDifficulty;
  count: number;
  allSamples: boolean;
}

const PROMPTS_DIR = path.join(process.cwd(), "content", "prompts");
const OUTPUT_DIR = path.join(process.cwd(), "content", "generated");

const TEMPLATE_JOBS: Array<{
  file: string;
  difficulty: PuzzleDifficulty;
  count: number;
}> = [
  { file: "detective-multiple-choice.md", difficulty: "easy", count: 1 },
  { file: "detective-multiple-choice.md", difficulty: "medium", count: 1 },
  { file: "detective-multiple-choice.md", difficulty: "hard", count: 1 },
  { file: "math-numeric-fill.md", difficulty: "easy", count: 1 },
  { file: "math-numeric-fill.md", difficulty: "medium", count: 1 },
  { file: "math-numeric-fill.md", difficulty: "hard", count: 1 },
  { file: "pattern-multiple-choice.md", difficulty: "easy", count: 1 },
  { file: "pattern-multiple-choice.md", difficulty: "medium", count: 1 },
  { file: "pattern-multiple-choice.md", difficulty: "hard", count: 1 },
];

function parseArgs(argv: string[]): GenerateOptions {
  const options: GenerateOptions = {
    difficulty: "easy",
    count: 3,
    allSamples: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--template") options.template = argv[++i];
    if (arg === "--difficulty")
      options.difficulty = argv[++i] as PuzzleDifficulty;
    if (arg === "--count") options.count = Number(argv[++i]);
    if (arg === "--all-samples") options.allSamples = true;
  }

  return options;
}

function renderPrompt(
  template: string,
  difficulty: PuzzleDifficulty,
  count: number
): string {
  return template
    .replaceAll("{{difficulty}}", difficulty)
    .replaceAll("{{count}}", String(count));
}

async function callAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

  if (!apiKey) {
    throw new Error("缺少 ANTHROPIC_API_KEY，請設定於 .env.local");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API 錯誤 (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content.find((block) => block.type === "text");
  if (!textBlock?.text) {
    throw new Error("Anthropic 回傳內容為空");
  }

  return textBlock.text.trim();
}

function extractJsonArray(raw: string): unknown[] {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw.trim();

  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("無法從 AI 回應中解析 JSON 陣列");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as unknown[];
}

async function generateFromTemplate(
  templateFile: string,
  difficulty: PuzzleDifficulty,
  count: number
): Promise<GeneratedPuzzleInput[]> {
  const templatePath = path.join(PROMPTS_DIR, templateFile);
  const template = await readFile(templatePath, "utf-8");
  const prompt = renderPrompt(template, difficulty, count);

  console.log(`→ 生成 ${templateFile} / ${difficulty} / ${count} 題 ...`);
  const raw = await callAnthropic(prompt);
  const parsed = extractJsonArray(raw);
  const { valid, invalid } = validatePuzzleBatch(parsed);

  if (invalid.length > 0) {
    console.warn("⚠ 驗證失敗題目：");
    invalid.forEach(({ index, errors }) => {
      console.warn(`  [#${index}] ${errors.join("; ")}`);
    });
  }

  console.log(`✓ 有效 ${valid.length} 題 / 無效 ${invalid.length} 題`);
  return valid;
}

async function writeBatch(puzzles: GeneratedPuzzleInput[], label: string) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(OUTPUT_DIR, `batch-${label}-${timestamp}.json`);
  await writeFile(filePath, JSON.stringify(puzzles, null, 2), "utf-8");
  console.log(`\n已寫入：${filePath}`);
  return filePath;
}

async function listTemplates(): Promise<string[]> {
  const files = await readdir(PROMPTS_DIR);
  return files.filter((file) => file.endsWith(".md"));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const allPuzzles: GeneratedPuzzleInput[] = [];

  if (options.allSamples) {
    for (const job of TEMPLATE_JOBS) {
      const batch = await generateFromTemplate(
        job.file,
        job.difficulty,
        job.count
      );
      allPuzzles.push(...batch);
    }
    await writeBatch(allPuzzles, "all-samples");
    return;
  }

  if (!options.template) {
    const templates = await listTemplates();
    console.log("可用模板：");
    templates.forEach((file) => console.log(`  - ${file}`));
    console.log("\n範例：");
    console.log(
      "  npm run generate:puzzles -- --template detective-multiple-choice --difficulty easy --count 3"
    );
    console.log("  npm run generate:puzzles -- --all-samples");
    return;
  }

  const templateFile = options.template.endsWith(".md")
    ? options.template
    : `${options.template}.md`;

  const puzzles = await generateFromTemplate(
    templateFile,
    options.difficulty,
    options.count
  );
  await writeBatch(puzzles, options.template.replace(".md", ""));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
