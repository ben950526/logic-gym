/** Midjourney 區域背景與節點佈局（有圖的區域走美術模式） */

export interface ZoneArtNode {
  /** 0–100，相對場景寬度 */
  x: number;
  /** 0–100，相對場景高度 */
  y: number;
}

export interface ZoneArtConfig {
  backgroundSrc: string;
  /** 依關卡 index（0 = 第 1 關）排列，沿 MJ 圖上的 S 形小路 */
  nodes: ZoneArtNode[];
}

/** 10 區通用 S 形交錯（左右 30↔70、垂直 ≥9%，避免圓圈重疊） */
export const DEFAULT_ZONE_PATH_NODES: ZoneArtNode[] = [
  { x: 50, y: 93 },
  { x: 68, y: 84 },
  { x: 32, y: 75 },
  { x: 70, y: 66 },
  { x: 30, y: 57 },
  { x: 68, y: 48 },
  { x: 32, y: 39 },
  { x: 66, y: 30 },
  { x: 28, y: 22 },
  { x: 58, y: 10 },
];

/** 各區 MJ 背景檔名 — 對照 docs/midjourney-asset-brief.md */
export const ZONE_BACKGROUND_FILES: Record<number, string> = {
  1: "zone-01-landing.png",
  2: "zone-02-signal.png",
  3: "zone-03-library.png",
  4: "zone-04-market.png",
  5: "zone-05-harbor.png",
  6: "zone-06-bazaar.png",
  7: "zone-07-warehouse.png",
  8: "zone-08-logic.png",
  9: "zone-09-expedition.png",
  10: "zone-10-boss.png",
};

function zoneArt(
  zoneNum: number,
  nodes: ZoneArtNode[] = DEFAULT_ZONE_PATH_NODES
): ZoneArtConfig {
  const file = ZONE_BACKGROUND_FILES[zoneNum];
  return {
    backgroundSrc: `/assets/zones/${file}`,
    nodes,
  };
}

/** 已放入 public/assets/zones/ 的區域（1–10 全部就位） */
const ZONES_WITH_ART: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ZONE_ART: Record<number, ZoneArtConfig> = {
  1: zoneArt(1, [
    { x: 50, y: 93 },
    { x: 68, y: 84 },
    { x: 32, y: 75 },
    { x: 70, y: 66 },
    { x: 30, y: 57 },
    { x: 68, y: 48 },
    { x: 32, y: 39 },
    { x: 66, y: 30 },
    { x: 28, y: 22 },
    { x: 58, y: 10 },
  ]),
  /** 通訊塔 S 形土路，與第 1 區同佈局 */
  2: zoneArt(2),
  /** 書塔中央石徑，頂部 BOSS 略靠塔頂 */
  3: zoneArt(3, [
    { x: 50, y: 93 },
    { x: 68, y: 84 },
    { x: 32, y: 75 },
    { x: 70, y: 66 },
    { x: 30, y: 57 },
    { x: 68, y: 48 },
    { x: 32, y: 39 },
    { x: 66, y: 30 },
    { x: 28, y: 22 },
    { x: 50, y: 10 },
  ]),
  4: zoneArt(4),
  5: zoneArt(5),
  6: zoneArt(6),
  7: zoneArt(7),
  8: zoneArt(8),
  9: zoneArt(9),
  10: zoneArt(10),
};

export function getZoneArtConfig(zoneNum: number): ZoneArtConfig | null {
  if (!ZONES_WITH_ART.includes(zoneNum)) return null;
  return ZONE_ART[zoneNum] ?? null;
}

export function hasZoneArt(zoneNum: number): boolean {
  return ZONES_WITH_ART.includes(zoneNum);
}
