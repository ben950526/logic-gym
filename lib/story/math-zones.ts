import { readFile } from "fs/promises";
import path from "path";
import { loadPlanetMap } from "@/lib/stages/planet-map";

export interface MathZoneStoryMeta {
  title: string;
  synopsis: string;
  villain: string;
  style?: string;
  storyVersion?: string;
}

export interface MathStageBeat {
  intro: string;
  mission: string;
  clear: string;
}

export interface MathZoneStory {
  zone: number;
  name: string;
  /** 區第 1 關開場（舊格式；若已有 stages 則忽略） */
  intro?: string;
  bossIntro: string;
  cleared: string;
  /** 推薦：每關一組，開場／任務／破關不會錯位 */
  stages?: MathStageBeat[];
  /** @deprecated 請改用 stages */
  intros?: string[];
  /** @deprecated 請改用 stages */
  missions?: string[];
  /** @deprecated 請改用 stages */
  clears?: string[];
}

export interface MathZoneStoryFile {
  meta?: MathZoneStoryMeta;
  zones: MathZoneStory[];
}

export interface MathStageStoryFull {
  stageId: string;
  order: number;
  stageName: string;
  topicType: string;
  zone: number;
  zoneName: string;
  isBoss: boolean;
  intro: string;
  mission: string;
  clear: string;
  bossIntro: string | null;
  zoneCleared: string | null;
}

export async function loadMathZoneStory(): Promise<MathZoneStoryFile> {
  const raw = await readFile(
    path.join(process.cwd(), "content", "story", "math-zones.json"),
    "utf-8"
  );
  return JSON.parse(raw) as MathZoneStoryFile;
}

export function parseMathStageId(stageId: string): {
  zone: number;
  indexInZone: number;
} | null {
  const match = stageId.match(/^math-(\d+)$/);
  if (!match) return null;
  const order = parseInt(match[1], 10);
  if (order < 1 || order > 100) return null;
  const zone = Math.ceil(order / 10);
  const indexInZone = (order - 1) % 10;
  return { zone, indexInZone };
}

function resolveZoneStageBeat(
  zoneStory: MathZoneStory,
  indexInZone: number
): MathStageBeat | null {
  if (zoneStory.stages?.[indexInZone]) {
    return zoneStory.stages[indexInZone];
  }

  const intro =
    indexInZone === 0
      ? zoneStory.intro
      : zoneStory.intros?.[indexInZone - 1];
  const mission = zoneStory.missions?.[indexInZone];
  const clear = zoneStory.clears?.[indexInZone];

  if (!intro || !mission || !clear) return null;

  return { intro, mission, clear };
}

export async function getMathStageStory(stageId: string) {
  const parsed = parseMathStageId(stageId);
  if (!parsed) return null;

  const data = await loadMathZoneStory();
  const zoneStory = data.zones.find((z) => z.zone === parsed.zone);
  if (!zoneStory) return null;

  const { indexInZone } = parsed;
  const isBoss = indexInZone === 9;
  const beat = resolveZoneStageBeat(zoneStory, indexInZone);
  if (!beat) return null;

  return {
    beat: `第 ${parsed.zone} 區 · ${zoneStory.name}`,
    intro: beat.intro,
    mission: beat.mission,
    clear: beat.clear,
    bossIntro: isBoss ? zoneStory.bossIntro : null,
    zoneCleared: isBoss ? zoneStory.cleared : null,
  };
}

/** 100 關完整劇情（供檢查頁 / 匯出） */
export async function getAllMathStageStories(): Promise<{
  meta: MathZoneStoryMeta | null;
  stages: MathStageStoryFull[];
}> {
  const [data, map] = await Promise.all([loadMathZoneStory(), loadPlanetMap()]);
  const mathPlanet =
    map.planets.find((p) => p.id === "math-planet") ??
    map.planets.find((p) => p.slug === "math");
  if (!mathPlanet) {
    return { meta: data.meta ?? null, stages: [] };
  }

  const stages: MathStageStoryFull[] = [];

  for (const stage of mathPlanet.stages) {
    const parsed = parseMathStageId(stage.id);
    if (!parsed) continue;

    const zoneStory = data.zones.find((z) => z.zone === parsed.zone);
    if (!zoneStory) continue;

    const { indexInZone } = parsed;
    const isBoss = indexInZone === 9;

    const beat = resolveZoneStageBeat(zoneStory, indexInZone);
    if (!beat) continue;

    stages.push({
      stageId: stage.id,
      order: stage.order,
      stageName: stage.name,
      topicType: stage.topicType ?? "",
      zone: parsed.zone,
      zoneName: stage.zoneName ?? zoneStory.name,
      isBoss: Boolean(stage.isBoss ?? isBoss),
      intro: beat.intro,
      mission: beat.mission,
      clear: beat.clear,
      bossIntro: isBoss ? zoneStory.bossIntro : null,
      zoneCleared: isBoss ? zoneStory.cleared : null,
    });
  }

  stages.sort((a, b) => a.order - b.order);
  return { meta: data.meta ?? null, stages };
}

export const MATH_STAGE_IDS = Array.from(
  { length: 100 },
  (_, i) => `math-${String(i + 1).padStart(2, "0")}`
);
