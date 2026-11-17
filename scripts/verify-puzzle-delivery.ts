/**
 * 題目交付前總閘門 — 全部通過才可 seed / 交付使用者
 * Run: npm run verify:puzzle-delivery
 */
import { execSync } from "child_process";

const STEPS: { name: string; cmd: string }[] = [
  { name: "幼兒結構", cmd: "npm run verify:kindergarten-k" },
  { name: "幼兒品質", cmd: "npm run verify:kindergarten-quality" },
  { name: "幼兒顯示", cmd: "npm run verify:kindergarten-display" },
  { name: "試點 5 題", cmd: "npm run verify:pilot-5" },
  {
    name: "幼兒 JSON schema",
    cmd: "npm run validate:puzzles -- --file content/generated/kindergarten-logic-k.json",
  },
  {
    name: "試點 JSON schema",
    cmd: "npm run validate:puzzles -- --file content/generated/kindergarten-logic-k-pilot-5.json",
  },
  {
    name: "擴充 85 題 schema",
    cmd: "npm run validate:puzzles -- --file content/generated/kindergarten-logic-k-batch-2.json",
  },
];

function run(step: { name: string; cmd: string }) {
  console.log(`\n▶ ${step.name}…`);
  try {
    execSync(step.cmd, { stdio: "inherit", cwd: process.cwd() });
    console.log(`✓ ${step.name}`);
  } catch {
    console.error(`\n✗ ${step.name} 失敗 — 不可交付、不可 seed`);
    process.exit(1);
  }
}

console.log("題目交付閘門（PUZZLE-AUTHORING-WORKFLOW Phase 6）");
console.log("=".repeat(48));

for (const step of STEPS) {
  run(step);
}

console.log("\n" + "=".repeat(48));
console.log("✓ 全部閘門通過 — 可 upsert seed");
console.log("  仍須完成 Phase 5 自審紀錄與 Phase 8 人工 spot-check");
