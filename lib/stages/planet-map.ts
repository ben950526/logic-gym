import { readFile } from "fs/promises";
import path from "path";
import type { UserPlan } from "@/lib/constants";
import {
  patternPlanetRequiresSubscription,
  stageRequiresSubscription,
} from "@/lib/stage-access";
import type { GalaxyMap, Planet, PlanetStage, StageUnlockStatus } from "@/types/stage";

const MAP_PATH = path.join(
  process.cwd(),
  "content",
  "stages",
  "planet-map-v1.json"
);

let cachedMap: GalaxyMap | null = null;

export async function loadPlanetMap(): Promise<GalaxyMap> {
  // 開發模式每次重讀 JSON，避免改 planet-map 後地圖不更新
  if (process.env.NODE_ENV === "production" && cachedMap) {
    return cachedMap;
  }
  const raw = await readFile(MAP_PATH, "utf-8");
  const map = JSON.parse(raw) as GalaxyMap;
  if (process.env.NODE_ENV === "production") {
    cachedMap = map;
  }
  return map;
}

export async function getPlanetBySlug(slug: string): Promise<Planet | null> {
  const map = await loadPlanetMap();
  return map.planets.find((p) => p.slug === slug) ?? null;
}

export async function getStageById(stageId: string): Promise<{
  planet: Planet;
  stage: PlanetStage;
} | null> {
  const map = await loadPlanetMap();
  for (const planet of map.planets) {
    const stage = planet.stages.find((s) => s.id === stageId);
    if (stage) {
      return { planet, stage };
    }
  }
  return null;
}

export function isPlanetUnlocked(
  planet: Planet,
  clearedStageIds: Set<string>,
  allPlanets: Planet[]
): boolean {
  if (planet.unlockRule === "default") return true;

  const match = planet.unlockRule.match(/^clear_planet:(.+)$/);
  if (!match) return true;

  const requiredPlanetId = match[1];
  const required = allPlanets.find((p) => p.id === requiredPlanetId);
  if (!required) return false;

  return required.stages.every((s) => clearedStageIds.has(s.id));
}

export function getStageStatus(
  planet: Planet,
  stage: PlanetStage,
  clearedStageIds: Set<string>,
  planetUnlocked: boolean,
  plan: UserPlan = "free"
): StageUnlockStatus {
  if (clearedStageIds.has(stage.id)) return "cleared";
  if (!planetUnlocked) return "locked";

  let progressionAvailable: boolean;
  if (stage.order === 1) {
    progressionAvailable = true;
  } else {
    const prev = planet.stages.find((s) => s.order === stage.order - 1);
    progressionAvailable = prev ? clearedStageIds.has(prev.id) : true;
  }

  if (!progressionAvailable) return "locked";

  if (stageRequiresSubscription(planet.slug, stage, plan)) {
    return "paywall";
  }

  return "available";
}

export function isPatternPlanetAccessible(
  planet: Planet,
  clearedStageIds: Set<string>,
  allPlanets: Planet[],
  plan: UserPlan
): boolean {
  if (!isPlanetUnlocked(planet, clearedStageIds, allPlanets)) return false;
  if (patternPlanetRequiresSubscription(plan)) return false;
  return true;
}
