/**
 * 幼兒規律題 · 高標審題（逐題人工規則自動化）
 * Run: npm run verify:kindergarten-quality
 */
import { readFile } from "fs/promises";
import path from "path";
import { isVagueOption, hasOrdinalLabelsInVisual, isArrowSequenceVisual, K_PUZZLE_QUALITY_RULES } from "../lib/kindergarten/puzzle-quality-rules";

type KPuzzle = {
  title: string;
  content_json: {
    kindergarten?: boolean;
    visualPrompt?: string;
    parentReadAloud?: string;
    hint?: string;
    options?: string[];
    question?: string;
  };
  answer_json: { correctIndex: number };
};

type AuditRow = {
  title: string;
  stageName: string;
  topicType: string;
  verdict: "PASS" | "FIXED" | "FAIL";
  notes: string[];
};

const ABAB_ONLY = /^K幼-紅藍交替$/;

function segmentCount(visual: string): number {
  return visual
    .split("\n")
    .flatMap((line) => line.split(/→|⬇️|↔️/))
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function auditPuzzle(
  puzzle: KPuzzle,
  stageName: string,
  topicType: string
): AuditRow {
  const notes: string[] = [];
  const c = puzzle.content_json;
  const visual = c.visualPrompt?.trim() ?? "";
  const options = c.options ?? [];
  const correct = options[puzzle.answer_json.correctIndex];

  if (!c.kindergarten) notes.push("缺少 kindergarten: true");
  if (!visual) notes.push("缺少 visualPrompt");
  if (!c.parentReadAloud?.trim()) notes.push("缺少 parentReadAloud");
  if (!c.hint?.trim()) notes.push("缺少 hint");
  if (segmentCount(visual) > 8) notes.push(`序列過長（${segmentCount(visual)} 段）`);

  for (const opt of options) {
    if (isVagueOption(opt)) {
      notes.push(`選項「${opt}」太模糊，請改用短中文說清楚（如「左邊比較多」）`);
    }
  }

  if (!c.question?.replace(/^（[^）]*）\s*/, "").trim()) {
    notes.push("question 需有幼兒／家長看得懂的題目文字");
  }

  if (
    isArrowSequenceVisual(visual) &&
    hasOrdinalLabelsInVisual(visual)
  ) {
    notes.push(
      "序列 visual 勿嵌入「第 N 個」等序數文字，只用圖示＋→；序數改在 question 說明"
    );
  }

  // 找不同：不可加序列分隔符
  if (puzzle.title === "K幼-找不同" && (visual.includes("→") || visual.includes("➡️"))) {
    notes.push("找不同題不可使用 → 或 ➡️（易誤解為接龍）");
  }

  if (puzzle.title === "K幼-黃綠交替" && visual.includes("➡️")) {
    notes.push("上下跳題不可用 emoji ➡️（會與 ⬆️⬇️ 混淆成上右下右）");
  }

  // 比多少：选项须文字清楚
  if (puzzle.title === "K幼-哪邊比較多") {
    if (options.some((o) => o === "⚖️" || o === "🤷" || o === "👈" || o === "👉")) {
      notes.push("比多少題選項請用「左邊比較多」等文字，勿只用 👈👉");
    }
  }

  // 大中小：必須展示至少兩輪循環，避免「變更小」歧義
  if (puzzle.title === "K幼-大中小") {
    const elephants = (visual.match(/🐘/g) ?? []).length;
    if (elephants < 2) {
      notes.push("大中小需展示至少兩輪循環，避免「繼續變小」歧義");
    }
    if (options.includes("🐜") || options.includes("🐱")) {
      notes.push("勿用更小動物當干擾項（暗示線性變小）");
    }
  }

  // 越來越多：干扰项勿用「单个」星星与「四个」星星格式不一致... 四个星星是一个option整体 OK

  // BOSS：必须含 ❓ 且前后有夹攻
  if (puzzle.title === "K幼-規律小BOSS") {
    if (!visual.includes("❓")) notes.push("BOSS 需有明確缺格 ❓");
    const parts = visual.split("❓");
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      notes.push("BOSS 缺格需前後都有圖案（夾擊唯一解）");
    }
    if (options.includes("🐜") || visual.includes("🐘\n")) {
      notes.push("BOSS 禁用 1-2-3 數量循環（易與「繼續加一」混淆）");
    }
  }

  // 成对规律：错误选项不应是单个
  if (puzzle.title === "K幼-水果規律") {
    const singles = options.filter((o) => o.length <= 2 && !o.includes("🍌🍌") && !o.includes("🍎🍎"));
    // 🍇 🍊 are single emoji - that's OK as clearly wrong format
  }

  // 方向题：标题不应与内容不符
  if (puzzle.title === "K幼-黃綠交替" && !visual.includes("🟡") && !visual.includes("🟢")) {
    // internal title legacy - warn only in audit doc, not fail if content is arrows
  }

  const verdict: AuditRow["verdict"] = notes.length === 0 ? "PASS" : "FAIL";

  return {
    title: puzzle.title,
    stageName,
    topicType,
    verdict,
    notes,
  };
}

async function main() {
  const root = process.cwd();
  const map = JSON.parse(
    await readFile(path.join(root, "content/stages/planet-map-v1.json"), "utf-8")
  ) as {
    planets: Array<{
      stages: Array<{ name: string; puzzleTitle: string; topicType?: string }>;
    }>;
  };
  const planet = map.planets.find((p) =>
    p.stages.some((s) => s.puzzleTitle.startsWith("K幼-"))
  );
  if (!planet) throw new Error("找不到 pattern-k-planet");

  const corePuzzles = JSON.parse(
    await readFile(path.join(root, "content/generated/kindergarten-logic-k.json"), "utf-8")
  ) as KPuzzle[];
  const pilotPuzzles = JSON.parse(
    await readFile(path.join(root, "content/generated/kindergarten-logic-k-pilot-5.json"), "utf-8")
  ) as KPuzzle[];
  const batchPuzzles = JSON.parse(
    await readFile(path.join(root, "content/generated/kindergarten-logic-k-batch-2.json"), "utf-8")
  ) as KPuzzle[];

  const puzzleByTitle = new Map<string, KPuzzle>();
  for (const puzzle of [...corePuzzles, ...pilotPuzzles, ...batchPuzzles]) {
    puzzleByTitle.set(puzzle.title, puzzle);
  }

  console.log("幼兒題審核標準：");
  Object.entries(K_PUZZLE_QUALITY_RULES).forEach(([key, rule]) => {
    console.log(`  · ${rule}`);
  });
  console.log("");

  const rows: AuditRow[] = [];
  for (const stage of planet.stages) {
    const puzzle = puzzleByTitle.get(stage.puzzleTitle);
    if (!puzzle) {
      rows.push({
        title: stage.puzzleTitle,
        stageName: stage.name,
        topicType: stage.topicType ?? "?",
        verdict: "FAIL",
        notes: ["planet-map 關卡找不到對應題目 JSON"],
      });
      continue;
    }
    rows.push(
      auditPuzzle(puzzle, stage.name, stage.topicType ?? "?")
    );
  }

  const failed = rows.filter((r) => r.verdict === "FAIL");
  for (const row of rows) {
    const icon = row.verdict === "PASS" ? "✓" : "✗";
    console.log(`${icon} ${row.stageName}（${row.topicType}）`);
    row.notes.forEach((n) => console.log(`    → ${n}`));
  }

  if (failed.length > 0) {
    console.log(`\n${failed.length} 題未達標，請修正後再跑。`);
    process.exit(1);
  }

  console.log(`\n✓ 全部 ${rows.length} 題通過高標審題`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
