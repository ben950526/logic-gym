/** 星系＝主題（各宇宙內共用同一套主題名稱） */

export interface GalaxyTheme {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
}

export const GALAXY_THEMES: GalaxyTheme[] = [
  {
    slug: "logic",
    name: "邏輯星系",
    emoji: "🧠",
    tagline: "數學 · 推理 · 規律",
  },
  {
    slug: "literary",
    name: "語文星系",
    emoji: "📖",
    tagline: "閱讀 · 識字 · 語感",
  },
  {
    slug: "nature",
    name: "自然星系",
    emoji: "🌿",
    tagline: "觀察 · 現象 · 提問",
  },
  {
    slug: "chronos",
    name: "時空星系",
    emoji: "⏳",
    tagline: "時間 · 空間 · 序列",
  },
  {
    slug: "creative",
    name: "創意星系",
    emoji: "🎨",
    tagline: "想像 · 設計 · 組合",
  },
  {
    slug: "civic",
    name: "社會星系",
    emoji: "🏛️",
    tagline: "生活 · 公民 · 判斷",
  },
];

export function getGalaxyThemeBySlug(slug: string): GalaxyTheme | undefined {
  return GALAXY_THEMES.find((g) => g.slug === slug);
}

/** @deprecated 改用 world-catalog；保留給舊 import 過渡 */
export type GalaxyEntry = GalaxyTheme & {
  playable?: boolean;
  mapId?: string;
};

/** @deprecated 改用 UNIVERSES + world-catalog */
export const GALAXIES: GalaxyEntry[] = GALAXY_THEMES.map((theme) => ({
  ...theme,
  playable: theme.slug === "logic",
  mapId: theme.slug === "logic" ? "logic-galaxy" : undefined,
}));

export function getGalaxyBySlug(slug: string): GalaxyEntry | undefined {
  return GALAXIES.find((g) => g.slug === slug);
}

export function getPlayableGalaxy(): GalaxyEntry {
  return GALAXIES.find((g) => g.slug === "logic")!;
}
