/**
 * 幼兒題：DB 缺 visualPrompt 時仍能顯示圖案
 * Run: npm run verify:kindergarten-display
 */
import {
  getKindergartenDisplay,
  getKindergartenQuestionText,
  isKindergartenStageContext,
  mergeKindergartenContent,
} from "../lib/kindergarten/puzzle-content";
import type { PuzzleRecord } from "../types/puzzle";

function makePuzzle(content: PuzzleRecord["content_json"]): PuzzleRecord {
  return {
    id: "test",
    type: "multiple_choice",
    category: "pattern",
    difficulty: "easy",
    title: "K幼-動物排排",
    content_json: content,
    answer_json: { correctIndex: 0 },
    explanation: "test",
    status: "verified",
    created_at: new Date(0).toISOString(),
  };
}

const dbOnly = makePuzzle({
  question: "（幼兒視覺題：看動物規律，點選下一個）",
  options: ["🐱", "🐶", "🐰", "🐻"],
  hint: "小貓和小狗輪流",
});

const localFull = makePuzzle({
  kindergarten: true,
  visualPrompt: "🐱   🐶   🐱   🐶   ❓",
  parentReadAloud: "小貓、小狗、小貓、小狗……下一只是誰？",
  question: "（幼兒題：K-P1）下一只是誰？",
  options: ["🐱", "🐶", "🐰", "🐻"],
  hint: "小貓和小狗輪流",
});

const merged = mergeKindergartenContent(dbOnly, localFull);
const display = getKindergartenDisplay(merged.content_json);

if (!isKindergartenStageContext("pattern-k", "pattern-k-02", merged)) {
  throw new Error("pattern-k 關卡應判定為幼兒題");
}

if (!display.visualPrompt?.includes("🐱")) {
  throw new Error("合併後仍缺少貓狗圖案序列");
}

if (display.readAloud !== "下一只是誰？") {
  throw new Error("aria 應使用 question 一句話，而非 parentReadAloud");
}

const questionLine = getKindergartenQuestionText(merged.content_json as { question?: string });
if (questionLine !== "下一只是誰？") {
  throw new Error("question 應去掉內部前綴後為一句話");
}

console.log("✓ 幼兒題顯示邏輯 OK");
console.log(`  圖案：${display.visualPrompt}`);
