/**
 * Merge math-100 batches + 燒繩計時 into library.json (dedupe by title)
 * Run: npx tsx scripts/merge-math-library.ts
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const LIB = path.join(ROOT, "content", "generated", "library.json");
const BATCHES = [
  path.join(ROOT, "content", "generated", "math-100-batch-1.json"),
  path.join(ROOT, "content", "generated", "math-100-batch-2.json"),
  path.join(ROOT, "content", "generated", "detective-gold-from-user.json"),
];

async function main() {
  const library = JSON.parse(await readFile(LIB, "utf-8")) as Array<{ title: string; category: string }>;
  const byTitle = new Map(library.map((p) => [p.title, p]));

  let added = 0;
  for (const batchPath of BATCHES) {
    const batch = JSON.parse(await readFile(batchPath, "utf-8")) as Array<{
      title: string;
      category: string;
    }>;
    for (const p of batch) {
      if (p.category !== "math") continue;
      if (!byTitle.has(p.title)) {
        byTitle.set(p.title, p);
        added++;
      }
    }
  }

  const merged = [...byTitle.values()];
  await writeFile(LIB, JSON.stringify(merged, null, 2));

  const map = JSON.parse(
    await readFile(path.join(ROOT, "content", "stages", "planet-map-v1.json"), "utf-8")
  ) as { planets: Array<{ id: string; stages: Array<{ puzzleTitle: string }> }> };
  const mathStages = map.planets.find((p) => p.id === "math-planet")!.stages;
  const missing = mathStages
    .map((s) => s.puzzleTitle)
    .filter((t) => !byTitle.has(t));

  console.log(`✓ library.json: ${merged.length} puzzles (+${added} new)`);
  console.log(`✓ math stages: ${mathStages.length}`);
  if (missing.length) {
    console.log(`⚠ missing puzzle content for ${missing.length} titles:`);
    missing.forEach((t) => console.log(`  - ${t}`));
  } else {
    console.log("✓ all 100 math stage titles have puzzle content in library");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
