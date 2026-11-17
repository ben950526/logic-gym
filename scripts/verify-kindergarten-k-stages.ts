/**
 * 幼兒宇宙 · 規律星球 100 關：planet-map + library 題目是否齊全
 * Run: npm run verify:kindergarten-k
 */
import { readFile } from "fs/promises";
import path from "path";

const STAGE_COUNT = 100;
const ZONE_COUNT = 10;
const STAGES_PER_ZONE = 10;

const PUZZLE_FILES = [
  "content/generated/kindergarten-logic-k.json",
  "content/generated/kindergarten-logic-k-pilot-5.json",
  "content/generated/kindergarten-logic-k-batch-2.json",
];

const ZONES = [
  "登陸補給區",
  "能源通訊站",
  "圖書記錄塔",
  "農場交易市",
  "工程時間港",
  "折扣比例域",
  "分配餘數庫",
  "邏輯推理所",
  "綜合遠征線",
  "變異牧場核心",
];

async function loadAllPuzzles(root: string) {
  const map = new Map<
    string,
    { content_json: { kindergarten?: boolean; visualPrompt?: string; question?: string } }
  >();
  for (const file of PUZZLE_FILES) {
    const items = JSON.parse(await readFile(path.join(root, file), "utf-8")) as Array<{
      title: string;
      content_json: { kindergarten?: boolean; visualPrompt?: string; question?: string };
    }>;
    for (const p of items) {
      if (!map.has(p.title)) map.set(p.title, p);
    }
  }
  return map;
}

async function main() {
  const root = process.cwd();
  const map = JSON.parse(
    await readFile(path.join(root, "content/stages/planet-map-v1.json"), "utf-8")
  ) as {
    planets: Array<{
      id: string;
      slug: string;
      stageCount: number;
      stages: Array<{
        order: number;
        puzzleTitle: string;
        zone?: number;
        zoneName?: string;
        topicType?: string;
      }>;
    }>;
  };

  const planet = map.planets.find((p) => p.id === "pattern-k-planet");
  if (!planet) throw new Error("planet-map 缺少 pattern-k-planet");

  const puzzles = await loadAllPuzzles(root);

  if (planet.stageCount !== STAGE_COUNT) {
    throw new Error(`pattern-k stageCount 應為 ${STAGE_COUNT}，目前 ${planet.stageCount}`);
  }
  if (planet.stages.length !== STAGE_COUNT) {
    throw new Error(`pattern-k-planet 應有 ${STAGE_COUNT} 關，目前 ${planet.stages.length}`);
  }

  for (let z = 1; z <= ZONE_COUNT; z++) {
    const inZone = planet.stages.filter((s) => s.zone === z);
    if (inZone.length !== STAGES_PER_ZONE) {
      throw new Error(`第 ${z} 區應有 ${STAGES_PER_ZONE} 關，目前 ${inZone.length}`);
    }
    const expectedName = ZONES[z - 1];
    for (const s of inZone) {
      if (s.zoneName !== expectedName) {
        throw new Error(`第 ${s.order} 關 zoneName 應為「${expectedName}」`);
      }
    }
  }

  for (let i = 0; i < planet.stages.length; i++) {
    const order = planet.stages[i]!.order;
    if (order !== i + 1) {
      throw new Error(`關卡順序應 1–${STAGE_COUNT} 連續，第 ${i} 筆 order=${order}`);
    }
  }

  for (const stage of planet.stages) {
    const puzzle = puzzles.get(stage.puzzleTitle);
    if (!puzzle) {
      throw new Error(`planet-map 關卡缺少題目：${stage.puzzleTitle}`);
    }
    if (puzzle.content_json.kindergarten !== true) {
      throw new Error(`${stage.puzzleTitle} 缺少 kindergarten: true`);
    }
    if (!puzzle.content_json.visualPrompt?.trim()) {
      throw new Error(`${stage.puzzleTitle} 缺少 visualPrompt`);
    }
  }

  const topicTypes = planet.stages.map((s) => s.topicType ?? "");
  if (new Set(topicTypes).size !== topicTypes.length) {
    throw new Error("pattern-k 關卡 topicType 有重複");
  }

  console.log(`✓ 幼兒規律星球 ${STAGE_COUNT} 關結構 OK（${ZONE_COUNT} 區 × ${STAGES_PER_ZONE} 關）`);
  console.log(`  題庫檔：${PUZZLE_FILES.length} 個、共 ${puzzles.size} 題`);
  console.log(`  星球 slug: ${planet.slug}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
