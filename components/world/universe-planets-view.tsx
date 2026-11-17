import { CatalogPlanetCard } from "@/components/world/catalog-planet-card";

import { PlanetCard } from "@/components/stages/planet-card";

import { GamePanel } from "@/components/game/game-panel";

import { isPaidPlan } from "@/lib/stage-access";

import { isPlanetUnlocked, loadPlanetMap } from "@/lib/stages/planet-map";

import { getClearedStageIds } from "@/lib/stages/progress";

import type { GalaxyInUniverse } from "@/lib/world/world-catalog";

import type { UniverseEntry } from "@/lib/world/universes";

import type { UserPlan } from "@/lib/constants";
import { cn } from "@/lib/utils";



interface UniversePlanetsViewProps {

  universe: UniverseEntry;

  galaxy: GalaxyInUniverse;

  userId: string;

  plan: UserPlan;

}



export async function UniversePlanetsView({

  universe,

  galaxy,

  userId,

  plan,

}: UniversePlanetsViewProps) {

  const [map, cleared] = await Promise.all([

    loadPlanetMap(),

    getClearedStageIds(userId),

  ]);



  const playableEntries = galaxy.planets.filter((p) => p.playable);

  const soonEntries = galaxy.planets.filter((p) => !p.playable);



  return (

    <>

      <div className="mb-6 text-center">

        <p className="text-xs font-medium text-[var(--game-text-muted)]">

          {universe.emoji} {universe.name} · {galaxy.theme.emoji} {galaxy.theme.name}

        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--game-text)]">

          選擇星球

        </h1>

        <p className="mt-1 text-xs text-[var(--game-text-muted)]">

          {universe.ageLabel} · {galaxy.theme.tagline}

        </p>

      </div>



      {!galaxy.playable && (

        <GamePanel className="game-panel-adventure mb-5">

          <p className="text-center text-sm leading-relaxed text-[#4e342e]">

            {universe.name}的{galaxy.theme.name}尚在建造中。

            可以先到

            <strong> 中年級宇宙 → 邏輯星系 </strong>

            體驗目前已上線的乳牛星球與規律星球。

          </p>

        </GamePanel>

      )}



      {playableEntries.length > 0 && (

        <div className="grid gap-3">

          {playableEntries.map((entry) => {

            const planet = map.planets.find((p) => p.id === entry.mapPlanetId);

            if (!planet) return null;



            const unlocked = isPlanetUnlocked(planet, cleared, map.planets);

            const needsSubscription =

              planet.slug === "pattern" && unlocked && !isPaidPlan(plan);

            const clearedCount = planet.stages.filter((s) => cleared.has(s.id)).length;



            return (

              <PlanetCard

                key={entry.slug}

                planet={planet}

                clearedCount={clearedCount}

                unlocked={unlocked}

                needsSubscription={needsSubscription}

                theme="space"

              />

            );

          })}

        </div>

      )}



      {soonEntries.length > 0 && (

        <div className={cn("grid gap-3", playableEntries.length > 0 && "mt-5")}>

          {playableEntries.length > 0 && (

            <p className="world-section-kicker">規劃中的星球</p>

          )}

          {soonEntries.map((entry) => (

            <CatalogPlanetCard key={entry.slug} entry={entry} />

          ))}

        </div>

      )}



      {galaxy.planets.length === 0 && (

        <GamePanel className="game-panel-adventure">

          <p className="text-center text-sm text-[#4e342e]">

            {galaxy.theme.name}的星球清單尚在規劃中，敬請期待。

          </p>

        </GamePanel>

      )}

    </>

  );

}

