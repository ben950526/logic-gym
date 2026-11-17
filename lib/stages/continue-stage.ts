import type { UserPlan } from "@/lib/constants";
import { isPaidPlan } from "@/lib/stage-access";
import {
  getStageStatus,
  isPlanetUnlocked,
  loadPlanetMap,
} from "@/lib/stages/planet-map";

export type ContinueStageResult = {
  planet: Awaited<ReturnType<typeof loadPlanetMap>>["planets"][number];
  stage: Awaited<ReturnType<typeof loadPlanetMap>>["planets"][number]["stages"][number];
  kind: "play" | "paywall";
};

export function findContinueStageFromMap(
  planets: Awaited<ReturnType<typeof loadPlanetMap>>["planets"],
  cleared: Set<string>,
  plan: UserPlan
): ContinueStageResult | null {
  for (const planet of planets) {
    if (planet.slug === "pattern" && !isPaidPlan(plan)) continue;

    const unlocked = isPlanetUnlocked(planet, cleared, planets);
    if (!unlocked) continue;

    for (const stage of planet.stages) {
      const status = getStageStatus(planet, stage, cleared, unlocked, plan);
      if (status === "paywall") {
        return { planet, stage, kind: "paywall" };
      }
      if (status === "available") {
        return { planet, stage, kind: "play" };
      }
    }
  }

  return null;
}
