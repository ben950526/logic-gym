/**
 * 世界目錄：宇宙 × 星系（主題）× 星球
 * 題目關卡仍由 planet-map-v1.json 提供；此處只定義導覽結構。
 */

import { GALAXY_THEMES, type GalaxyTheme } from "@/lib/world/galaxy-themes";
import {
  DEFAULT_UNIVERSE_SLUG,
  getUniverseBySlug,
  type UniverseEntry,
} from "@/lib/world/universes";

export interface PlanetCatalogEntry {
  slug: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  /** 對應 planet-map-v1.json 的 planet.id；有值且 map 存在才可進關卡 */
  mapPlanetId?: string;
  playable: boolean;
  comingSoonNote?: string;
}

export interface GalaxyInUniverse {
  theme: GalaxyTheme;
  /** 此宇宙內是否至少有一顆可玩星球 */
  playable: boolean;
  planets: PlanetCatalogEntry[];
}

/** 各宇宙 × 星系下的星球配置（題目之後再填） */
const WORLD_PLANETS: Record<
  string,
  Partial<Record<string, PlanetCatalogEntry[]>>
> = {
  kindergarten: {
    logic: [
      {
        slug: "pattern-k",
        name: "規律星球",
        subtitle: "看圖選答案 · 不用識字",
        icon: "🎨",
        color: "#FFB74D",
        mapPlanetId: "pattern-k-planet",
        playable: true,
      },
      {
        slug: "sense-k",
        name: "數感星球",
        subtitle: "比多少 · 數一數 · 找不同",
        icon: "🔢",
        color: "#81C784",
        playable: false,
        comingSoonNote: "圖像題為主，適合親子共讀",
      },
    ],
    literary: [
      {
        slug: "picture-k",
        name: "圖畫星球",
        subtitle: "看圖說故事 · 找關鍵字",
        icon: "📚",
        color: "#F06292",
        playable: false,
        comingSoonNote: "圖像識字啟蒙",
      },
    ],
    nature: [
      {
        slug: "observe-k",
        name: "觀察星球",
        subtitle: "動植物 · 天氣 · 比較",
        icon: "🐛",
        color: "#66BB6A",
        playable: false,
        comingSoonNote: "生活觀察題",
      },
    ],
  },
  "grades-1-2": {
    logic: [
      {
        slug: "math-g12",
        name: "算數星球",
        subtitle: "20 以內 · 簡單加減 · 生活題",
        icon: "➕",
        color: "#64B5F6",
        playable: false,
        comingSoonNote: "短句一步應用",
      },
      {
        slug: "logic-g12",
        name: "推理星球",
        subtitle: "比較 · 分類 · 簡單邏輯",
        icon: "🧩",
        color: "#9575CD",
        playable: false,
        comingSoonNote: "圖文並茂",
      },
    ],
    literary: [
      {
        slug: "read-g12",
        name: "識字星球",
        subtitle: "國字 · 詞語 · 短句理解",
        icon: "✏️",
        color: "#FF8A65",
        playable: false,
        comingSoonNote: "注音輔助規劃中",
      },
    ],
    nature: [
      {
        slug: "nature-g12",
        name: "自然星球",
        subtitle: "簡單觀察 · 生活科學",
        icon: "🌿",
        color: "#4DB6AC",
        playable: false,
        comingSoonNote: "現象與提問",
      },
    ],
  },
  "grades-3-4": {
    logic: [
      {
        slug: "math",
        name: "乳牛星球",
        subtitle: "牧場大冒險 · 100 關遠征",
        icon: "🐄",
        color: "#3B82F6",
        mapPlanetId: "math-planet",
        playable: true,
      },
      {
        slug: "pattern",
        name: "規律星球",
        subtitle: "通關乳牛星球後解鎖 · 8 關",
        icon: "🌀",
        color: "#8B5CF6",
        mapPlanetId: "pattern-planet",
        playable: true,
      },
    ],
    literary: [
      {
        slug: "read-g34",
        name: "閱讀星球",
        subtitle: "短文 · 推論 · 語文邏輯",
        icon: "📖",
        color: "#EC407A",
        playable: false,
        comingSoonNote: "語文星系首發星球",
      },
    ],
    nature: [
      {
        slug: "nature-g34",
        name: "實驗星球",
        subtitle: "觀察 · 假設 · 簡單推理",
        icon: "🔬",
        color: "#26A69A",
        playable: false,
        comingSoonNote: "自然星系規劃中",
      },
    ],
  },
};

export function getGalaxiesForUniverse(universeSlug: string): GalaxyInUniverse[] {
  const planetMap = WORLD_PLANETS[universeSlug] ?? {};

  return GALAXY_THEMES.map((theme) => {
    const planets = planetMap[theme.slug] ?? [];
    const playable = planets.some((p) => p.playable);
    return { theme, playable, planets };
  });
}

export function getGalaxyInUniverse(
  universeSlug: string,
  galaxySlug: string
): GalaxyInUniverse | undefined {
  return getGalaxiesForUniverse(universeSlug).find((g) => g.theme.slug === galaxySlug);
}

export function getPlanetCatalogEntry(
  universeSlug: string,
  galaxySlug: string,
  planetSlug: string
): PlanetCatalogEntry | undefined {
  const galaxy = getGalaxyInUniverse(universeSlug, galaxySlug);
  return galaxy?.planets.find((p) => p.slug === planetSlug);
}

/** 從 planet-map 的 slug 反查所在宇宙／星系（現有 math / pattern） */
export function findPlanetWorldLocation(planetSlug: string): {
  universe: UniverseEntry;
  galaxySlug: string;
} | null {
  for (const universe of Object.keys(WORLD_PLANETS)) {
    const galaxies = WORLD_PLANETS[universe]!;
    for (const [galaxySlug, planets] of Object.entries(galaxies)) {
      if (planets?.some((p) => p.slug === planetSlug && p.playable)) {
        const u = getUniverseBySlug(universe);
        if (u) return { universe: u, galaxySlug };
      }
    }
  }
  return null;
}

export function buildUniverseGalaxyHref(
  universeSlug: string,
  galaxySlug: string
): string {
  return `/universe/${universeSlug}/galaxy/${galaxySlug}`;
}

export function buildUniverseHref(universeSlug: string): string {
  return `/universe/${universeSlug}`;
}

export function getDefaultLogicGalaxyHref(): string {
  return buildUniverseGalaxyHref(DEFAULT_UNIVERSE_SLUG, "logic");
}
