/**
 * 謎題引擎驗證：大量產生題目，確認每一題都「有解且只有一個解」（一筆畫：一定畫得完）。
 * 執行：npm run verify:puzzle-engine
 */
import { BOSS_SLOT, CHEST_SLOT, nodeAt } from "../lib/puzzles/adventure";
import {
  emptyGarden, ensureStarted, feed, fertilize, grant, harvest, photograph, placeOnPlate, plant, plotCountFor, plotStatus, puzzleReward, visitorsPresent, water,
} from "../lib/garden/logic";
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

console.log("=== 冒險路線圖 ===");
{
  for (let k = 0; k < 120; k++) {
    const n = nodeAt(k);
    if (n.slot === CHEST_SLOT && n.kind !== "chest") fail(`第 ${k + 1} 關應該是寶箱`);
    if (n.slot === BOSS_SLOT && !n.boss) fail(`第 ${k + 1} 關應該是 BOSS`);
    if (n.kind === "puzzle" && (!n.game || n.level < 1)) fail(`第 ${k + 1} 關缺少謎題種類或難度`);
    if (k > 0 && n.kind === "puzzle" && n.game === nodeAt(k - 1).game) fail(`第 ${k}、${k + 1} 關是同一種謎題（應該輪流）`);
    if (n.boss) {
      const p = nodeAt(k - 1);
      if (n.level <= p.level) fail(`第 ${k + 1} 關 BOSS 難度沒有比前一關高`);
    }
  }
  // 難度不會倒退太多：每章的第一關不低於上一章第一關
  for (let c = 1; c < 12; c++) if (nodeAt(c * 10).level < nodeAt((c - 1) * 10).level) fail(`第 ${c + 1} 章開頭難度比上一章低`);
}
console.log("  120 個點檢查完畢");

console.log("=== 花園 ===");
{
  const H = 3600_000;
  const t0 = Date.UTC(2026, 10, 17, 8);
  let g = ensureStarted(emptyGarden());
  if ((g.seeds.tulip ?? 0) !== 2 || (g.seeds.carrot ?? 0) !== 1) fail("新手禮物應該是 2 鬱金香 + 1 紅蘿蔔");
  if (ensureStarted(g).seeds.tulip !== 2) fail("新手禮物只能發一次");
  g = plant(g, 0, "tulip", t0);
  if (plotStatus(g.plots[0], t0 + 10 * H).kind !== "thirsty") fail("沒澆水不應該長");
  if (plant(g, 0, "carrot", t0) !== g) fail("有植物的土不能再種");
  g = water(g, 0, t0);
  const mid = plotStatus(g.plots[0], t0 + 0.5 * H);
  if (mid.kind !== "growing" || mid.stage !== 1) fail(`鬱金香長到一半應該是小苗，實際 ${JSON.stringify(mid)}`);
  if (harvest(g, 0, t0 + 0.5 * H).fruit) fail("還沒熟不能收成");
  if (plotStatus(g.plots[0], t0 + 1 * H).kind !== "ready") fail("鬱金香 1 小時應該成熟");
  if (!visitorsPresent(g, t0 + 1 * H).includes("butterfly")) fail("鬱金香成熟應該吸引蝴蝶");
  const h1 = harvest(g, 0, t0 + 1 * H);
  if (h1.fruit !== "tulip" || h1.garden.plots[0].plant !== null || h1.garden.basket.tulip !== 1) fail("收成後應該拿到花、土地清空");
  g = h1.garden;
  // 快轉倍率：600 倍時 1 小時 = 6 秒
  let f = plant(grant(g, { seeds: ["tulip"], fertilizer: 0 }), 1, "tulip", t0);
  f = water(f, 1, t0);
  if (plotStatus(f.plots[1], t0 + 6000, 600).kind !== "ready") fail("600 倍快轉時 6 秒應該成熟");
  // 肥料
  let fz = water(plant(grant(g, { seeds: ["sunflower"], fertilizer: 1 }), 2, "sunflower", t0), 2, t0);
  fz = fertilize(fz, 2, t0);
  if (plotStatus(fz.plots[2], t0).kind !== "ready" || fz.fertilizer !== 0) fail("肥料應該讓植物馬上成熟並扣一包");
  // 蘋果樹會一直結果
  let ap = water(plant(grant(g, { seeds: ["apple"], fertilizer: 0 }), 3, "apple", t0), 3, t0);
  const ha = harvest(ap, 3, t0 + 12 * H);
  if (ha.fruit !== "apple" || ha.garden.plots[3].plant !== "apple") fail("蘋果樹收成後應該留在土裡");
  ap = ha.garden;
  if (plotStatus(ap.plots[3], t0 + 12 * H + 1).kind !== "growing") fail("蘋果樹收成後應該重新長");
  // 狐狸：3 種同時成熟
  let fox = grant(emptyGarden(), { seeds: ["tulip", "carrot", "strawberry"], fertilizer: 0 });
  (["tulip", "carrot", "strawberry"] as const).forEach((id, i) => { fox = water(plant(fox, i, id, t0), i, t0); });
  const vis = visitorsPresent(fox, t0 + 4 * H);
  if (!vis.includes("fox") || !vis.includes("rabbit") || !vis.includes("hedgehog")) fail(`3 種成熟應該有狐狸，實際 ${vis}`);
  if (visitorsPresent(fox, t0 + 3 * H).includes("fox")) fail("只有 2 種成熟不應該有狐狸");
  // 點心盤：西瓜引來小熊和烏龜，3 小時後失效
  let pl = { ...emptyGarden(), basket: { watermelon: 1 } };
  pl = placeOnPlate(pl, "watermelon", t0);
  const pv = visitorsPresent(pl, t0 + H);
  if (!pv.includes("bear") || !pv.includes("turtle")) fail(`點心盤放西瓜應該有小熊和烏龜，實際 ${pv}`);
  if (visitorsPresent(pl, t0 + 4 * H).length) fail("點心盤 3 小時後應該沒有訪客");
  // 餵腦腦
  const fd = feed({ ...emptyGarden(), basket: { apple: 1, tulip: 1 } }, "apple");
  if (fd.stars !== 3 || (fd.garden.basket.apple ?? 0) !== 0) fail("餵蘋果應該 +3 星並扣掉");
  if (feed(emptyGarden(), "tulip").stars !== 0) fail("沒有果實不能餵");
  // 拍照
  const ph = photograph(emptyGarden(), "rabbit");
  if (!ph.isNew || photograph(ph.garden, "rabbit").isNew) fail("同一個訪客只算一次新發現");
  // 擴建
  let ex = { ...emptyGarden(), harvests: 4, seeds: { tulip: 1 } };
  ex = water(plant(ex, 0, "tulip", t0), 0, t0);
  const he = harvest(ex, 0, t0 + H);
  if (!he.expanded || he.garden.plots.length !== 6) fail(`第 5 次收成應該擴建成 6 格，實際 ${he.garden.plots.length}`);
  if (plotCountFor(15) !== 9) fail("15 次收成應該是 9 格");
  // 獎勵
  for (let i = 0; i < 50; i++) {
    const r = puzzleReward(true, rng);
    if (r.seeds.length !== 2 || !["apple", "watermelon"].includes(r.seeds[1])) fail("BOSS 應該給一顆稀有種子");
  }
}
console.log("  情境檢查完畢");

if (failures) {
  console.log(`\n✗ ${failures} 個問題`);
  process.exit(1);
}
console.log("\n✓ 全部通過");
