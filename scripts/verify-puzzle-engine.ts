/**
 * 謎題引擎驗證：大量產生題目，確認每一題都「有解且只有一個解」（一筆畫：一定畫得完）。
 * 執行：npm run verify:puzzle-engine
 */
import { BOSS_SLOT, nodeAt } from "../lib/puzzles/adventure";
import { countSolutions as nonoCount, isUnique, makeRandom } from "../lib/puzzles/nonogram";
import { PICTURES, picturePuzzle } from "../lib/puzzles/pictures";
import { seededRng } from "../lib/puzzles/random";
import { hasEulerPath, makeStroke } from "../lib/puzzles/stroke";
import { countSolutions as sudokuCount, isValidSolution, makeSudoku } from "../lib/puzzles/sudoku";
import { growthNote, nextTreeStage, stageProgress, TREE_STAGES, treeCounts, treeStageOf, treeSvg } from "../lib/puzzles/tree";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log("  ✗ " + msg);
};

console.log("=== 數織圖鑑圖案 ===");
const names = new Set<string>();
for (const pic of PICTURES) {
  const n = pic.rows.length;
  if (pic.rows.some((r) => r.length !== n)) fail(`${pic.name}：不是正方形`);
  else if (!isUnique(picturePuzzle(pic))) fail(`${pic.name}：塗法不只一種`);
  if (names.has(pic.name)) fail(`${pic.name}：名稱重複`);
  names.add(pic.name);
}
console.log(`  ${PICTURES.length} 張檢查完畢`);

const rng = seededRng(20261117);

console.log("=== 隨機數織 ===");
for (const n of [5, 6, 7]) {
  for (let i = 0; i < 15; i++) {
    const p = makeRandom(n, rng);
    if (nonoCount(p.n, p.rowClues, p.colClues, 3) !== 1) fail(`${n}×${n} 第 ${i + 1} 題不是唯一解`);
  }
}
console.log("  45 題檢查完畢");

console.log("=== 一筆畫 ===");
for (const level of [1, 3, 6, 10]) {
  for (let i = 0; i < 50; i++) {
    const p = makeStroke(level, rng);
    if (!hasEulerPath(p.nodes, p.edges)) fail(`level ${level} 第 ${i + 1} 題畫不完`);
    if (p.edges.length < 5) fail(`level ${level} 第 ${i + 1} 題線太少（${p.edges.length}）`);
  }
}
console.log("  200 題檢查完畢");

console.log("=== 4×4 數獨 ===");
for (const level of [1, 3, 6]) {
  for (let i = 0; i < 50; i++) {
    const p = makeSudoku(level, rng);
    if (!isValidSolution(p.solution)) fail(`level ${level} 第 ${i + 1} 題答案本身不合法`);
    if (sudokuCount(p.givens, 3) !== 1) fail(`level ${level} 第 ${i + 1} 題不是唯一解`);
    if (p.givens.some((v, k) => v && v !== p.solution[k])) fail(`level ${level} 第 ${i + 1} 題提示和答案不一致`);
  }
}
console.log("  150 題檢查完畢");

console.log("=== 冒險路線圖 ===");
{
  for (let k = 0; k < 120; k++) {
    const n = nodeAt(k);
    if (n.slot === BOSS_SLOT && !n.boss) fail(`第 ${k + 1} 關應該是 BOSS`);
    if (!n.game || n.level < 1) fail(`第 ${k + 1} 關缺少謎題種類或難度`);
    if (k > 0 && n.game === nodeAt(k - 1).game) fail(`第 ${k}、${k + 1} 關是同一種謎題（應該輪流）`);
    if (n.boss) {
      const p = nodeAt(k - 1);
      if (n.level <= p.level) fail(`第 ${k + 1} 關 BOSS 難度沒有比前一關高`);
    }
  }
  // 難度不會倒退太多：每章的第一關不低於上一章第一關
  for (let c = 1; c < 12; c++) if (nodeAt(c * 10).level < nodeAt((c - 1) * 10).level) fail(`第 ${c + 1} 章開頭難度比上一章低`);
}
console.log("  120 個點檢查完畢");

console.log("=== 我的樹 ===");
{
  // 階段門檻由小到大，第一階段從 0 開始
  if (TREE_STAGES[0].at !== 0) fail("第一個階段應該從 0 滴開始");
  for (let i = 1; i < TREE_STAGES.length; i++) if (TREE_STAGES[i].at <= TREE_STAGES[i - 1].at) fail(`第 ${i + 1} 個階段的門檻沒有變大`);
  // 每一滴水都要有看得到的變化（到 100 滴為止）
  for (let d = 1; d <= 100; d++) {
    const before = treeSvg(d - 1), after = treeSvg(d);
    if (before === after) fail(`第 ${d} 滴水畫面沒有變化`);
    if (!growthNote(d)) fail(`第 ${d} 滴水缺少說明`);
    const p = stageProgress(d);
    if (p < 0 || p > 1) fail(`第 ${d} 滴的進度 ${p} 超出範圍`);
  }
  // 東西只會越來越多，不會變少
  for (let d = 1; d <= 160; d++) {
    const a = treeCounts(d - 1), b = treeCounts(d);
    for (const k of ["clusters", "flowers", "fruits", "lights"] as const) if (b[k] < a[k]) fail(`第 ${d} 滴的 ${k} 變少了`);
  }
  // 「新長出來」的動畫只出現在有東西長出來時
  if (!treeSvg(10, true).includes("lgp-t-new")) fail("第 10 滴應該有新長出的葉子動畫");
  if (treeSvg(10, false).includes("lgp-t-new")) fail("一般顯示不應該有新長出的動畫");
  if (treeStageOf(0) !== 0 || treeStageOf(100) !== TREE_STAGES.length - 1) fail("階段計算錯誤");
  if (nextTreeStage(100) !== null) fail("100 滴之後應該沒有下一個階段");
  if (!treeSvg(100).includes("lgp-t-star") || !treeSvg(70).includes("#ffe1b0")) fail("100 滴應該有星星、70 滴應該有樹屋");
}
console.log("  1～160 滴檢查完畢");

if (failures) {
  console.log(`\n✗ ${failures} 個問題`);
  process.exit(1);
}
console.log("\n✓ 全部通過");
