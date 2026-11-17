/**
 * 規律星球 100 關：合併既有 15 題 + 新增 85 題，更新 planet-map
 * Run: npx tsx scripts/build-kindergarten-planet-100.ts
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NEW_K_PUZZLES } from "./data/kindergarten-100-new-puzzles";
import { validatePuzzleBatch } from "../lib/puzzle-validation";
import type { GeneratedPuzzleInput } from "@/types/puzzle";

function normalizePuzzle(puzzle: GeneratedPuzzleInput): GeneratedPuzzleInput {
  const steps = puzzle.explanationSteps?.map((s, i) =>
    s.length >= 5 ? s : `步驟 ${i + 1}：${s}`
  );
  return { ...puzzle, explanationSteps: steps };
}

const ZONES = [
  { zone: 1, name: "登陸補給區" },
  { zone: 2, name: "能源通訊站" },
  { zone: 3, name: "圖書記錄塔" },
  { zone: 4, name: "農場交易市" },
  { zone: 5, name: "工程時間港" },
  { zone: 6, name: "折扣比例域" },
  { zone: 7, name: "分配餘數庫" },
  { zone: 8, name: "邏輯推理所" },
  { zone: 9, name: "綜合遠征線" },
  { zone: 10, name: "變異牧場核心" },
] as const;

/** 既有 1–15 關（planet-map 對照） */
const EXISTING_STAGES = [
  { order: 1, id: "pattern-k-01", name: "紅藍彩虹", puzzleTitle: "K幼-紅藍交替", topicType: "雙色交替", isBoss: false },
  { order: 2, id: "pattern-k-02", name: "三種動物", puzzleTitle: "K幼-動物排排", topicType: "三種循環", isBoss: false },
  { order: 3, id: "pattern-k-03", name: "比一比", puzzleTitle: "K幼-哪邊比較多", topicType: "比多少", isBoss: false },
  { order: 4, id: "pattern-k-04", name: "越來越多", puzzleTitle: "K幼-形狀接龍", topicType: "數量遞增", isBoss: false },
  { order: 5, id: "pattern-k-05", name: "找不同", puzzleTitle: "K幼-找不同", topicType: "觀察力", isBoss: false },
  { order: 6, id: "pattern-k-06", name: "上下跳", puzzleTitle: "K幼-黃綠交替", topicType: "方向規律", isBoss: false },
  { order: 7, id: "pattern-k-07", name: "大中小", puzzleTitle: "K幼-大中小", topicType: "大小序列", isBoss: false },
  { order: 8, id: "pattern-k-08", name: "數數看", puzzleTitle: "K幼-數數接龍", topicType: "數字順序", isBoss: false },
  { order: 9, id: "pattern-k-09", name: "兩個一組", puzzleTitle: "K幼-水果規律", topicType: "成對規律", isBoss: false },
  { order: 10, id: "pattern-k-10", name: "中間缺誰", puzzleTitle: "K幼-規律小BOSS", topicType: "中間填空", isBoss: true },
  { order: 11, id: "pattern-k-11", name: "全是蘋果", puzzleTitle: "K幼-pilot-全是蘋果", topicType: "全組分類", isBoss: false },
  { order: 12, id: "pattern-k-12", name: "一樣多", puzzleTitle: "K幼-pilot-一樣多", topicType: "等量判斷", isBoss: false },
  { order: 13, id: "pattern-k-13", name: "兩紅一藍", puzzleTitle: "K幼-pilot-兩紅一藍", topicType: "三項循環", isBoss: false },
  { order: 14, id: "pattern-k-14", name: "誰比較大", puzzleTitle: "K幼-pilot-誰比較大", topicType: "大小比較", isBoss: false },
  { order: 15, id: "pattern-k-15", name: "第幾個", puzzleTitle: "K幼-pilot-第幾個", topicType: "序數定位", isBoss: false },
] as const;

function zoneForOrder(order: number) {
  return ZONES[Math.floor((order - 1) / 10)]!;
}

function difficultyForOrder(order: number): "easy" | "medium" | "hard" {
  if (order <= 30) return "easy";
  if (order <= 60) return order <= 50 ? "easy" : "medium";
  if (order <= 90) return "medium";
  return "hard";
}

async function main() {
  const root = process.cwd();

  if (NEW_K_PUZZLES.length !== 85) {
    throw new Error(`NEW_K_PUZZLES 應 85 題，目前 ${NEW_K_PUZZLES.length}`);
  }

  const newPuzzleObjects = NEW_K_PUZZLES.map((s) => normalizePuzzle(s.puzzle as GeneratedPuzzleInput));
  const { valid, invalid } = validatePuzzleBatch(newPuzzleObjects);
  if (invalid.length > 0) {
    invalid.forEach(({ index, errors }) => {
      const spec = NEW_K_PUZZLES[index]!;
      console.error(`  [order ${spec.order}] ${spec.puzzle.title}: ${errors.join("; ")}`);
    });
    throw new Error(`${invalid.length} 題 schema 驗證失敗`);
  }
  console.log(`✓ 新增 85 題 schema OK`);

  const batchPath = path.join(root, "content/generated/kindergarten-logic-k-batch-2.json");
  await writeFile(batchPath, JSON.stringify(valid, null, 2) + "\n", "utf-8");
  console.log(`✓ 寫入 ${batchPath}`);

  const newStages = NEW_K_PUZZLES.map((s) => {
    const z = zoneForOrder(s.order);
    return {
      order: s.order,
      id: s.id,
      name: s.stageName,
      puzzleTitle: s.puzzle.title,
      difficulty: s.puzzle.difficulty,
      zone: z.zone,
      zoneName: z.name,
      topicType: s.topicType,
      ...(s.isBoss ? { isBoss: true } : {}),
    };
  });

  const existingStages = EXISTING_STAGES.map((s) => {
    const z = zoneForOrder(s.order);
    return {
      order: s.order,
      id: s.id,
      name: s.name,
      puzzleTitle: s.puzzleTitle,
      difficulty: difficultyForOrder(s.order),
      zone: z.zone,
      zoneName: z.name,
      topicType: s.topicType,
      ...(s.isBoss ? { isBoss: true } : {}),
    };
  });

  const allStages = [...existingStages, ...newStages].sort((a, b) => a.order - b.order);
  if (allStages.length !== 100) throw new Error(`應 100 關，目前 ${allStages.length}`);

  const topics = allStages.map((s) => s.topicType);
  if (new Set(topics).size !== topics.length) {
    const dup = topics.filter((t, i) => topics.indexOf(t) !== i);
    throw new Error(`topicType 重複：${[...new Set(dup)].join("、")}`);
  }

  const curriculum = {
    version: "v2",
    planet: "pattern-k",
    stageCount: 100,
    zones: ZONES,
    stages: allStages,
  };
  await writeFile(
    path.join(root, "content/stages/kindergarten-curriculum-100.json"),
    JSON.stringify(curriculum, null, 2) + "\n",
    "utf-8"
  );
  console.log("✓ 寫入 content/stages/kindergarten-curriculum-100.json");

  const mapPath = path.join(root, "content/stages/planet-map-v1.json");
  const map = JSON.parse(await readFile(mapPath, "utf-8")) as {
    planets: Array<Record<string, unknown>>;
  };
  const planetIdx = map.planets.findIndex((p) => p.id === "pattern-k-planet");
  if (planetIdx < 0) throw new Error("找不到 pattern-k-planet");

  map.planets[planetIdx] = {
    id: "pattern-k-planet",
    slug: "pattern-k",
    name: "規律星球",
    subtitle: "看圖選答案 · 100 關遠征",
    color: "#FFB74D",
    icon: "🎨",
    unlockRule: "default",
    stageCount: 100,
    stages: allStages,
  };

  await writeFile(mapPath, JSON.stringify(map, null, 2) + "\n", "utf-8");
  console.log("✓ 更新 planet-map-v1.json pattern-k-planet（100 關）");
  console.log(`  第 1 區：${allStages.filter((s) => s.zone === 1).length} 關`);
  console.log(`  第 10 區 BOSS：${allStages.find((s) => s.order === 100)?.name}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
