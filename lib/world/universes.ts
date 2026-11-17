/** 宇宙＝年齡帶（先選宇宙 → 再選星系 → 再選星球） */

export interface UniverseEntry {
  slug: string;
  name: string;
  emoji: string;
  /** 例：幼兒園、小一～小二 */
  ageLabel: string;
  /** 例：4～6 歲 */
  ageRange: string;
  tagline: string;
  /** 推薦給家長的一句話 */
  parentPitch: string;
  /** 是否有可玩星球（至少一顆） */
  playable: boolean;
  sortOrder: number;
}

export const UNIVERSES: UniverseEntry[] = [
  {
    slug: "kindergarten",
    name: "幼兒宇宙",
    emoji: "🌱",
    ageLabel: "幼兒園",
    ageRange: "4～6 歲",
    tagline: "數感 · 圖形 · 觀察",
    parentPitch: "每天一關，用看的、比的、猜的開始動腦",
    playable: true,
    sortOrder: 1,
  },
  {
    slug: "grades-1-2",
    name: "低年級宇宙",
    emoji: "🚀",
    ageLabel: "小一～小二",
    ageRange: "6～8 歲",
    tagline: "算數 · 識字 · 生活應用",
    parentPitch: "短句題目，一步思考，建立信心",
    playable: false,
    sortOrder: 2,
  },
  {
    slug: "grades-3-4",
    name: "中年級宇宙",
    emoji: "🌌",
    ageLabel: "小三～小四",
    ageRange: "8～10 歲",
    tagline: "邏輯 · 應用 · 規律",
    parentPitch: "兩步推理，每天一兩關剛好",
    playable: true,
    sortOrder: 3,
  },
];

/** 目前內容（math / pattern）所在的宇宙 */
export const DEFAULT_UNIVERSE_SLUG = "grades-3-4";

export function getUniverseBySlug(slug: string): UniverseEntry | undefined {
  return UNIVERSES.find((u) => u.slug === slug);
}

export function getDefaultUniverse(): UniverseEntry {
  return UNIVERSES.find((u) => u.slug === DEFAULT_UNIVERSE_SLUG)!;
}

export function listUniversesSorted(): UniverseEntry[] {
  return [...UNIVERSES].sort((a, b) => a.sortOrder - b.sortOrder);
}
