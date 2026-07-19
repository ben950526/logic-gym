/**
 * 分析 MJ 框圖文字安全區 → inset 百分比 + debug 疊圖。
 * 用法：npm run analyze:shell-insets
 *
 * 策略：flood fill 找羊皮紙 + 固定 2.5% 內縮（不過度 strict 掃描）
 * → 輸出 shell-art-layout.generated.json
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

type InsetPct = { top: number; right: number; bottom: number; left: number };
type Profile = "parchment" | "whiteLabel";

type LayoutOutput = {
  aspectRatio: string;
  inset: string;
  raw: InsetPct;
  sampleScore: number;
  fluidMinHeight?: string;
};

const FLOOD_SHRINK = 0.025;

function loadPng(filePath: string) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function pixel(data: Buffer, width: number, x: number, y: number) {
  const i = (width * y + x) << 2;
  return { r: data[i]!, g: data[i + 1]!, b: data[i + 2]! };
}

function isSafe(r: number, g: number, b: number, profile: Profile) {
  if (profile === "parchment") {
    const sum = r + g + b;
    if (b > r + 14 || sum < 575) return false;
    return r > 210 && g > 196 && b > 168 && r - b < 50;
  }
  const sum = r + g + b;
  if (sum < 480 || r < 180) return false;
  return r > 228 && g > 228 && b > 220 && sum > 690;
}

function isStrictSafe(r: number, g: number, b: number, profile: Profile) {
  if (profile === "whiteLabel") {
    const sum = r + g + b;
    return r > 238 && g > 238 && b > 232 && sum > 710;
  }
  const sum = r + g + b;
  if (b > r + 10 || sum < 620) return false;
  return r > 228 && g > 218 && b > 195 && r - b < 45;
}

function findSeed(png: PNG, profile: Profile) {
  const { width, height, data } = png;
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  for (let radius = 0; radius < Math.max(width, height); radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const { r, g, b } = pixel(data, width, x, y);
        if (isSafe(r, g, b, profile)) return { x, y };
      }
    }
  }
  throw new Error("No safe seed pixel");
}

function floodBounds(png: PNG, profile: Profile) {
  const { width, height, data } = png;
  const seed = findSeed(png, profile);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [seed.y * width + seed.x];
  visited[seed.y * width + seed.x] = 1;

  let minX = seed.x;
  let maxX = seed.x;
  let minY = seed.y;
  let maxY = seed.y;

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ] as const) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const { r, g, b } = pixel(data, width, nx, ny);
      if (!isSafe(r, g, b, profile)) continue;
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }

  return { minX, maxX, minY, maxY };
}

function rowStrictRatio(
  png: PNG,
  profile: Profile,
  y: number,
  x0: number,
  x1: number
) {
  const { width, data } = png;
  let ok = 0;
  let total = 0;
  for (let x = x0; x <= x1; x++) {
    if (x < 0 || x >= width || y < 0 || y >= png.height) continue;
    const { r, g, b } = pixel(data, width, x, y);
    total++;
    if (isStrictSafe(r, g, b, profile)) ok++;
  }
  return total ? ok / total : 0;
}

/** 遠征卡：跳過頂部石牌亂碼帶 */
function findExpeditionTop(png: PNG, profile: Profile) {
  const { width, height } = png;
  const x0 = Math.floor(width * 0.22);
  const x1 = Math.ceil(width * 0.78);
  let consecutive = 0;
  for (let y = 0; y < Math.floor(height * 0.45); y++) {
    if (rowStrictRatio(png, profile, y, x0, x1) >= 0.84) {
      consecutive++;
      if (consecutive >= 3) return y - 2;
    } else {
      consecutive = 0;
    }
  }
  return Math.floor(height * 0.31);
}

function toInset(
  width: number,
  height: number,
  box: { minX: number; maxX: number; minY: number; maxY: number },
  shrinkPct: number
): InsetPct {
  const padX = Math.round(width * shrinkPct);
  const padY = Math.round(height * shrinkPct);
  const top = Math.min(height - 1, box.minY + padY);
  const bottom = Math.max(0, box.maxY - padY);
  const left = Math.min(width - 1, box.minX + padX);
  const right = Math.max(0, box.maxX - padX);

  return {
    top: (top / height) * 100,
    right: ((width - 1 - right) / width) * 100,
    bottom: ((height - 1 - bottom) / height) * 100,
    left: (left / width) * 100,
  };
}

function clampInset(i: InsetPct, min: Partial<InsetPct>, max: Partial<InsetPct>): InsetPct {
  return {
    top: Math.max(min.top ?? 0, Math.min(max.top ?? 100, i.top)),
    right: Math.max(min.right ?? 0, Math.min(max.right ?? 100, i.right)),
    bottom: Math.max(min.bottom ?? 0, Math.min(max.bottom ?? 100, i.bottom)),
    left: Math.max(min.left ?? 0, Math.min(max.left ?? 100, i.left)),
  };
}

function formatInset(i: InsetPct) {
  return `${i.top.toFixed(1)}% ${i.right.toFixed(1)}% ${i.bottom.toFixed(1)}% ${i.left.toFixed(1)}%`;
}

function drawDebugOverlay(png: PNG, inset: InsetPct, outPath: string) {
  const out = new PNG({ width: png.width, height: png.height });
  png.data.copy(out.data);

  const left = Math.round((inset.left / 100) * png.width);
  const right = Math.round(png.width - 1 - (inset.right / 100) * png.width);
  const top = Math.round((inset.top / 100) * png.height);
  const bottom = Math.round(png.height - 1 - (inset.bottom / 100) * png.height);

  const stroke = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= out.width || y >= out.height) return;
    const i = (out.width * y + x) << 2;
    out.data[i] = 255;
    out.data[i + 1] = 40;
    out.data[i + 2] = 40;
    out.data[i + 3] = 220;
  };

  for (let x = left; x <= right; x++) {
    for (let t = 0; t < 3; t++) {
      stroke(x, top + t);
      stroke(x, bottom - t);
    }
  }
  for (let y = top; y <= bottom; y++) {
    for (let t = 0; t < 3; t++) {
      stroke(left + t, y);
      stroke(right - t, y);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, PNG.sync.write(out));
}

function scoreInset(png: PNG, inset: InsetPct, profile: Profile) {
  const w = png.width;
  const h = png.height;
  const l = Math.round((inset.left / 100) * w);
  const r = Math.round(w - 1 - (inset.right / 100) * w);
  const t = Math.round((inset.top / 100) * h);
  const b = Math.round(h - 1 - (inset.bottom / 100) * h);
  const cx = Math.round((l + r) / 2);
  const cy = Math.round((t + b) / 2);
  const delta = Math.max(2, Math.round(Math.min(w, h) * 0.015));

  const checks: Array<{ safe: boolean; x: number; y: number }> = [
    { safe: true, x: cx, y: cy },
    { safe: true, x: l + delta, y: cy },
    { safe: true, x: r - delta, y: cy },
    { safe: true, x: cx, y: t + delta },
    { safe: true, x: cx, y: b - delta },
    { safe: false, x: Math.max(0, l - delta * 2), y: cy },
    { safe: false, x: Math.min(w - 1, r + delta * 2), y: cy },
    { safe: false, x: cx, y: Math.max(0, t - delta * 2) },
    { safe: false, x: cx, y: Math.min(h - 1, b + delta * 2) },
  ];

  let pass = 0;
  for (const c of checks) {
    const { r: pr, g, b: pb } = pixel(png.data, w, c.x, c.y);
    if (isSafe(pr, g, pb, profile) === c.safe) pass++;
  }
  return pass / checks.length;
}

const root = path.join(process.cwd(), "public", "assets", "shell");
const debugDir = path.join(root, "_debug");

function runOne(
  file: string,
  profile: Profile,
  tune?: (inset: InsetPct, png: PNG) => InsetPct
) {
  const png = loadPng(path.join(root, file));
  const flood = floodBounds(png, profile);
  let inset = toInset(png.width, png.height, flood, FLOOD_SHRINK);
  if (tune) inset = tune(inset, png);
  return { png, inset };
}

const dialogue = runOne("ui-panel-dialogue.png", "parchment", (i) =>
  clampInset(i, { left: 25.5 }, { top: 28, right: 24, bottom: 36 })
);

const chapter = runOne("ui-chapter-banner.png", "whiteLabel");

const puzzle = runOne("ui-panel-puzzle.png", "parchment", (i) =>
  clampInset(i, { left: 26, right: 26 }, { top: 24, bottom: 22 })
);

const mission = runOne("ui-panel-mission.png", "parchment", (i) =>
  clampInset(i, { left: 26 }, { top: 24, right: 28, bottom: 21 })
);

const expeditionRaw = runOne("ui-panel-expedition.png", "parchment");
const expeditionTopPx = findExpeditionTop(expeditionRaw.png, "parchment");
const expeditionTopPct = (expeditionTopPx / expeditionRaw.png.height) * 100;
const expedition = {
  png: expeditionRaw.png,
  inset: clampInset(
    {
      ...expeditionRaw.inset,
      top: Math.max(expeditionRaw.inset.top, expeditionTopPct, 31),
    },
    { left: 21 },
    { top: 36, right: 32, bottom: 29 }
  ),
};

for (const [name, item] of [
  ["ui-panel-dialogue", dialogue],
  ["ui-chapter-banner", chapter],
  ["ui-panel-puzzle", puzzle],
  ["ui-panel-mission", mission],
  ["ui-panel-expedition", expedition],
] as const) {
  drawDebugOverlay(
    item.png,
    item.inset,
    path.join(debugDir, `${name}-inset.png`)
  );
}

const output: Record<string, LayoutOutput> = {
  panelDialogue: {
    aspectRatio: `${dialogue.png.width} / ${dialogue.png.height}`,
    inset: formatInset(dialogue.inset),
    raw: dialogue.inset,
    sampleScore: scoreInset(dialogue.png, dialogue.inset, "parchment"),
  },
  chapterBanner: {
    aspectRatio: `${chapter.png.width} / ${chapter.png.height}`,
    inset: formatInset(chapter.inset),
    raw: chapter.inset,
    sampleScore: scoreInset(chapter.png, chapter.inset, "whiteLabel"),
  },
  panelPuzzle: {
    aspectRatio: `${puzzle.png.width} / ${puzzle.png.height}`,
    inset: formatInset(puzzle.inset),
    raw: puzzle.inset,
    sampleScore: scoreInset(puzzle.png, puzzle.inset, "parchment"),
  },
  panelMission: {
    aspectRatio: `${mission.png.width} / ${mission.png.height}`,
    inset: formatInset(mission.inset),
    raw: mission.inset,
    sampleScore: scoreInset(mission.png, mission.inset, "parchment"),
    fluidMinHeight: "9rem",
  },
  panelExpedition: {
    aspectRatio: `${expedition.png.width} / ${expedition.png.height}`,
    inset: formatInset(expedition.inset),
    raw: expedition.inset,
    sampleScore: scoreInset(expedition.png, expedition.inset, "parchment"),
  },
};

fs.writeFileSync(
  path.join(process.cwd(), "lib", "world", "shell-art-layout.generated.json"),
  JSON.stringify(output, null, 2)
);

console.log(JSON.stringify(output, null, 2));
console.log(`\nDebug overlays → public/assets/shell/_debug/`);

const minScore = Math.min(
  output.panelDialogue.sampleScore,
  output.chapterBanner.sampleScore,
  output.panelPuzzle.sampleScore,
  output.panelMission.sampleScore,
  output.panelExpedition.sampleScore
);

if (minScore < 0.55) {
  console.log(`\n⚠ Sample score ${(minScore * 100).toFixed(0)}% — review _debug overlays`);
  process.exitCode = 1;
} else {
  console.log("\n✓ Shell UI insets analyzed → shell-art-layout.generated.json");
}
