/**
 * 謎題引擎驗證：大量產生題目，確認每一題都「有解且只有一個解」（一筆畫：一定畫得完）。
 * 執行：npm run verify:puzzle-engine
 */
import { countSolutions as nonoCount, isUnique, makeRandom } from "../lib/puzzles/nonogram";
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

if (failures) {
  console.log(`\n✗ ${failures} 個問題`);
  process.exit(1);
}
console.log("\n✓ 全部通過");
