/**
 * 幼兒試點 5 題 · Phase 6 閘門
 * Run: npm run verify:pilot-5
 */
import { readFile } from "fs/promises";
import path from "path";
import { validatePuzzleBatch } from "../lib/puzzle-validation";
import { isVagueOption, hasOrdinalLabelsInVisual, isArrowSequenceVisual, K_PUZZLE_QUALITY_RULES } from "../lib/kindergarten/puzzle-quality-rules";

const PILOT_FILE = "content/generated/kindergarten-logic-k-pilot-5.json";

const REQUIRED_ABILITIES = [
  "K-C1",
  "K-M4",
  "K-P7",
  "K-S1",
  "K-G1",
] as const;

const TOPIC_TYPES = [
  "全組分類",
  "一樣多",
  "AAB 規律",
  "兩物比大小",
  "序數位置",
] as const;

type Puzzle = {
  title: string;
  content_json: {
    kindergarten?: boolean;
    visualPrompt?: string;
    parentReadAloud?: string;
    hint?: string;
    question?: string;
    options?: string[];
  };
  answer_json: { correctIndex: number };
};

function segmentCount(visual: string): number {
  return visual
    .split("\n")
    .flatMap((line) => line.split(/→|⬇️|↔️/))
    .map((s) => s.trim())
    .filter(Boolean).length;
}

async function main() {
  const root = process.cwd();
  const raw = await readFile(path.join(root, PILOT_FILE), "utf-8");
  const puzzles = JSON.parse(raw) as Puzzle[];

  console.log("幼兒試點 5 題 · Phase 6");
  console.log("審核標準：");
  Object.values(K_PUZZLE_QUALITY_RULES).forEach((r) => console.log(`  · ${r}`));
  console.log("");

  if (puzzles.length !== 5) {
    throw new Error(`試點應為 5 題，目前 ${puzzles.length} 題`);
  }

  const { valid, invalid } = validatePuzzleBatch(puzzles);
  if (invalid.length > 0) {
    invalid.forEach(({ index, errors }) =>
      console.error(`  [#${index}] ${errors.join("; ")}`)
    );
    throw new Error("JSON schema 驗證失敗");
  }
  console.log("✓ JSON schema（5 題）");

  const topics = new Set<string>();
  for (let i = 0; i < puzzles.length; i++) {
    const p = puzzles[i];
    const c = p.content_json;
    const ability = REQUIRED_ABILITIES[i];
    const topic = TOPIC_TYPES[i];

    if (!c.kindergarten) throw new Error(`${p.title} 缺少 kindergarten`);
    if (!c.visualPrompt?.trim()) throw new Error(`${p.title} 缺少 visualPrompt`);
    if (!c.parentReadAloud?.trim()) throw new Error(`${p.title} 缺少 parentReadAloud`);
    if (!c.hint?.trim()) throw new Error(`${p.title} 缺少 hint`);
    if (!c.question?.includes(ability)) {
      throw new Error(`${p.title} question 應標註能力 ${ability}`);
    }
    if (segmentCount(c.visualPrompt) > 8) {
      throw new Error(`${p.title} 序列過長`);
    }
    const idx = p.answer_json.correctIndex;
    if (idx < 0 || idx >= (c.options?.length ?? 0)) {
      throw new Error(`${p.title} correctIndex 超出範圍`);
    }
    if (topics.has(topic)) throw new Error(`topicType 重複：${topic}`);
    topics.add(topic);

    if (p.title.includes("找不同") && c.visualPrompt.includes("→")) {
      throw new Error("找不同不可有 →");
    }
    if (c.visualPrompt.includes("➡️")) {
      throw new Error(`${p.title} 不可用 emoji ➡️`);
    }
    if (
      isArrowSequenceVisual(c.visualPrompt) &&
      hasOrdinalLabelsInVisual(c.visualPrompt)
    ) {
      throw new Error(
        `${p.title} 序列 visual 勿寫「第 N 個」，只用圖示＋→；序數放 question`
      );
    }
    for (const opt of c.options ?? []) {
      if (isVagueOption(opt)) {
        throw new Error(`${p.title} 選項「${opt}」太模糊，請加短中文`);
      }
    }

    console.log(`✓ ${p.title.replace("K幼-pilot-", "")}（${topic} / ${ability}）`);
  }

  console.log("\n✓ 試點 5 題 Phase 6 通過");
  console.log("  下一步：你看 kindergarten-pilot-5-DELIVERY.md → spot-check → 決定是否排關 seed");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
