import { readFile } from "fs/promises";
import path from "path";
import type { GalaxyMap, Planet, PlanetStage } from "@/types/stage";

const MAP_PATH = path.join(
  process.cwd(),
  "content",
  "stages",
  "planet-map-v1.json"
);

let cachedMap: GalaxyMap | null = null;

export async function loadPlanetMap(): Promise<GalaxyMap> {
  if (cachedMap) return cachedMap;
  const raw = await readFile(MAP_PATH, "utf-8");
  cachedMap = JSON.parse(raw) as GalaxyMap;
  return cachedMap;
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
  planetUnlocked: boolean
): "locked" | "available" | "cleared" {
  if (clearedStageIds.has(stage.id)) return "cleared";
  if (!planetUnlocked) return "locked";

  if (stage.order === 1) return "available";

  const prev = planet.stages.find((s) => s.order === stage.order - 1);
  if (!prev) return "available";

  return clearedStageIds.has(prev.id) ? "available" : "locked";
}
