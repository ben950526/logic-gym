#!/usr/bin/env tsx
/**
 * P0 檢查：migration 008 + 108 題 verified
 * Run: npm run check:mvp
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { createSupabaseAdmin } from "../lib/supabase/puzzles";

config({ path: ".env.local" });

type PlanetMap = {
  planets: Array<{
    id: string;
    slug: string;
    stages: Array<{ id: string; puzzleTitle: string }>;
  }>;
};

async function main() {
  const root = process.cwd();
  const map = JSON.parse(
    await readFile(path.join(root, "content/stages/planet-map-v1.json"), "utf-8")
  ) as PlanetMap;

  const mathPlanet = map.planets.find((p) => p.id === "math-planet")!;
  const patternPlanet = map.planets.find((p) => p.id === "pattern-planet")!;
  const allTitles = [
    ...mathPlanet.stages.map((s) => ({ ...s, planet: "math" as const })),
    ...patternPlanet.stages.map((s) => ({ ...s, planet: "pattern" as const })),
  ];

  const supabase = createSupabaseAdmin();

  console.log("=== 1. stage_progress 表（migration 008）===");
  const { error: spErr } = await supabase.from("stage_progress").select("user_id").limit(1);
  if (spErr) {
    console.log("✗ 尚未建立或無法讀取");
    console.log(`  錯誤：${spErr.message}`);
    console.log("  → 請在 Supabase SQL Editor 執行 supabase/migrations/008_stage_progress_ascii.sql");
  } else {
    console.log("✓ stage_progress 表存在");
  }

  console.log("\n=== 2. 108 關題目 verified 狀態 ===");
  const titles = allTitles.map((s) => s.puzzleTitle);
  const { data: puzzles, error: pErr } = await supabase
    .from("puzzles")
    .select("title, status, category")
    .in("title", titles);

  if (pErr) throw pErr;

  const byTitle = new Map(puzzles?.map((p) => [p.title, p]) ?? []);
  let missing = 0;
  let notVerified = 0;

  for (const stage of allTitles) {
    const row = byTitle.get(stage.puzzleTitle);
    if (!row) {
      console.log(`✗ [${stage.planet}] ${stage.id} 缺題：${stage.puzzleTitle}`);
      missing++;
    } else if (row.status !== "verified") {
      console.log(`? [${stage.planet}] ${stage.id} 未上架：${stage.puzzleTitle} (${row.status})`);
      notVerified++;
    }
  }

  const ok = allTitles.length - missing - notVerified;
  console.log(`\n摘要：${ok}/${allTitles.length} 已 verified`);
  if (missing > 0) console.log(`  缺 ${missing} 題 → npm run verify:math-100 或 npm run verify:pattern-8`);
  if (notVerified > 0) console.log(`  待上架 ${notVerified} 題 → Admin 或 verify script`);

  if (spErr || missing > 0 || notVerified > 0) process.exit(1);
  console.log("\n✓ P0 後端就緒，可進行煙霧測試");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
