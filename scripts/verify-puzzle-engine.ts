/**
 * 謎題引擎驗證：大量產生題目，確認每一題都「有解且只有一個解」（一筆畫：一定畫得完）。
 * 執行：npm run verify:puzzle-engine
 */
import { canOpenChest, CHEST_BONUS_STARS, currentStreak, DAILY_GOAL, openChest, recordSolve } from "../lib/puzzles/daily";
import { countSolutions as nonoCount, isUnique, makeRandom } from "../lib/puzzles/nonogram";
import { emptySave } from "../lib/puzzles/save";
import { WARDROBE } from "../lib/puzzles/wardrobe";
import { PICTURES, picturePuzzle } from "../lib/puzzles/pictures";
import { seededRng } from "../lib/puzzles/random";
import { hasEulerPath, makeStroke } from "../lib/puzzles/stroke";
import { countSolutions as sudokuCount, isValidSolution, makeSudoku } from "../lib/puzzles/sudoku";

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

console.log("=== 每日任務／連續天數／寶箱 ===");
{
  let s = emptySave();
  s = { ...s, daily: { date: "2026-11-16", done: 0, opened: false } };
  for (let i = 0; i < DAILY_GOAL; i++) s = recordSolve(s, "2026-11-16").save;
  if (s.streak !== 1 || s.lastDoneDate !== "2026-11-16") fail(`第一天完成後連續天數應為 1，實際 ${s.streak}`);
  if (!canOpenChest(s, "2026-11-16")) fail("達標後應該能開寶箱");
  const opened = openChest(s, rng);
  if (!opened.item || canOpenChest(opened.save, "2026-11-16")) fail("寶箱應給裝扮且只能開一次");
  s = opened.save;
  // 隔天再完成 → 2 天
  for (let i = 0; i < DAILY_GOAL; i++) s = recordSolve(s, "2026-11-17").save;
  if (s.streak !== 2) fail(`連續第二天應為 2，實際 ${s.streak}`);
  if (s.daily.opened) fail("換日後寶箱應該重置");
  // 同一天多解幾題不會重複加天數
  for (let i = 0; i < 4; i++) s = recordSolve(s, "2026-11-17").save;
  if (s.streak !== 2) fail(`同一天多解題不應增加天數，實際 ${s.streak}`);
  // 中斷一天 → 顯示 0，再完成 → 重新從 1 開始
  if (currentStreak(s, "2026-11-19") !== 0) fail("斷一天後顯示應為 0");
  for (let i = 0; i < DAILY_GOAL; i++) s = recordSolve(s, "2026-11-19").save;
  if (s.streak !== 1) fail(`斷掉後重新開始應為 1，實際 ${s.streak}`);
  // 收齊全部裝扮後，寶箱改給星星
  let all = { ...s, items: WARDROBE.map((w) => w.id), daily: { date: "2026-11-19", done: 3, opened: false } };
  const before = all.stars;
  all = openChest(all, rng).save;
  if (all.stars !== before + CHEST_BONUS_STARS) fail("裝扮收齊後寶箱應給星星");
  // 月底跨月
  let m = { ...emptySave(), streak: 5, lastDoneDate: "2026-11-30" };
  for (let i = 0; i < DAILY_GOAL; i++) m = recordSolve(m, "2026-12-01").save;
  if (m.streak !== 6) fail(`跨月應接續連續天數，實際 ${m.streak}`);
}
console.log("  情境檢查完畢");

if (failures) {
  console.log(`\n✗ ${failures} 個問題`);
  process.exit(1);
}
console.log("\n✓ 全部通過");
