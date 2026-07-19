import { readFile } from "fs/promises";
import path from "path";

export interface CharacterTier {
  minCleared: number;
  title: string;
  emoji: string;
  glow: string;
}

export interface StoryAct {
  id: string;
  chapter: string;
  title: string;
  description: string;
}

export interface StageStoryLine {
  beat: string;
  intro: string;
  mission: string;
  clear: string;
}

export interface SeasonStory {
  season: number;
  title: string;
  synopsis: string;
  protagonist: { name: string; role: string };
  companion: { name: string; role: string };
  galaxyIntro: { headline: string; body: string; cta: string };
  acts: StoryAct[];
  planets: Record<
    string,
    { intro: string; bossIntro: string; cleared: string }
  >;
  stages: Record<string, StageStoryLine>;
  characterTiers: CharacterTier[];
}

import {
  getMathStageStory,
  MATH_STAGE_IDS,
  parseMathStageId,
} from "@/lib/story/math-zones";

const PATTERN_STAGES = Array.from({ length: 8 }, (_, i) =>
  `pattern-${String(i + 1).padStart(2, "0")}`
);

let cached: SeasonStory | null = null;

export async function loadSeasonStory(): Promise<SeasonStory> {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const raw = await readFile(
    path.join(process.cwd(), "content", "story", "season-1.json"),
    "utf-8"
  );
  const data = JSON.parse(raw) as SeasonStory;
  if (process.env.NODE_ENV === "production") cached = data;
  return data;
}

export function getCharacterTier(
  clearedCount: number,
  tiers: CharacterTier[]
): CharacterTier {
  const sorted = [...tiers].sort((a, b) => b.minCleared - a.minCleared);
  return sorted.find((t) => clearedCount >= t.minCleared) ?? tiers[0];
}

export async function getStageStory(stageId: string) {
  if (parseMathStageId(stageId)) {
    const math = await getMathStageStory(stageId);
    if (!math) return null;
    return {
      beat: math.beat,
      intro: math.intro,
      mission: math.mission,
      clear: math.clear,
    };
  }
  const story = await loadSeasonStory();
  return story.stages[stageId] ?? null;
}

export async function getPlanetStory(slug: string) {
  const story = await loadSeasonStory();
  return story.planets[slug] ?? null;
}

export function getActForStage(stageId: string, acts: StoryAct[]): StoryAct {
  if (stageId === "pattern-08") {
    return acts.find((a) => a.id === "finale") ?? acts[acts.length - 1];
  }
  if (MATH_STAGE_IDS.includes(stageId)) {
    return acts.find((a) => a.id === "act1") ?? acts[1];
  }
  if (PATTERN_STAGES.includes(stageId)) {
    return acts.find((a) => a.id === "act2") ?? acts[2];
  }
  return acts[0];
}

export function getPlanetAct(slug: string, acts: StoryAct[]): StoryAct | null {
  if (slug === "math") return acts.find((a) => a.id === "act1") ?? null;
  if (slug === "pattern") return acts.find((a) => a.id === "act2") ?? null;
  return null;
}

export async function getPreviousStageClearLine(stageId: string) {
  const parsed = parseMathStageId(stageId);
  if (parsed) {
    const order = (parsed.zone - 1) * 10 + parsed.indexInZone + 1;
    if (order <= 1) return null;
    const prevId = `math-${String(order - 1).padStart(2, "0")}`;
    const prev = await getMathStageStory(prevId);
    return prev?.clear ?? null;
  }
  if (stageId === "pattern-01") {
    const prev = await getMathStageStory("math-100");
    return prev?.clear ?? null;
  }
  const patternIndex = PATTERN_STAGES.indexOf(stageId);
  if (patternIndex > 0) {
    const story = await loadSeasonStory();
    return story.stages[PATTERN_STAGES[patternIndex - 1]]?.clear ?? null;
  }
  return null;
}
