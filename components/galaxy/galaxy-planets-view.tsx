import { PlanetCard } from "@/components/stages/planet-card";
import { StoryBubble } from "@/components/story/story-bubble";
import { GamePanel } from "@/components/game/game-panel";
import { GameButton } from "@/components/game/game-button";
import { isPaidPlan } from "@/lib/stage-access";
import { isPlanetUnlocked, loadPlanetMap } from "@/lib/stages/planet-map";
import {
  getClearedStageIds,
  isStageProgressTableReady,
} from "@/lib/stages/progress";
import {
  getActForStage,
  getStageStory,
  loadSeasonStory,
} from "@/lib/story/season-1";
import { findContinueStageFromMap } from "@/lib/stages/continue-stage";
import type { GalaxyEntry } from "@/lib/world/galaxies";
import type { UserPlan } from "@/lib/constants";

interface GalaxyPlanetsViewProps {
  galaxy: GalaxyEntry;
  userId: string;
  plan: UserPlan;
}

export async function GalaxyPlanetsView({
  galaxy,
  userId,
  plan,
}: GalaxyPlanetsViewProps) {
  const [map, story, cleared, tableReady] = await Promise.all([
    loadPlanetMap(),
    loadSeasonStory(),
    getClearedStageIds(userId),
    isStageProgressTableReady(),
  ]);

  const totalStages = map.planets.reduce((n, p) => n + p.stages.length, 0);
  const clearedTotal = map.planets.reduce(
    (n, p) => n + p.stages.filter((s) => cleared.has(s.id)).length,
    0
  );
  const continueAt = findContinueStageFromMap(map.planets, cleared, plan);
  const showSeasonIntro = clearedTotal === 0;
  const continueStory = continueAt
    ? await getStageStory(continueAt.stage.id)
    : null;
  const continueAct = continueAt
    ? getActForStage(continueAt.stage.id, story.acts)
    : null;

  return (
    <>
      {showSeasonIntro && (
        <div className="mb-5 space-y-3">
          <StoryBubble
            speaker={`${story.companion.name} · 第一季開場`}
            variant="intro"
            theme="adventure"
          >
            <span className="block font-semibold">{story.galaxyIntro.headline}</span>
            <span className="mt-2 block">{story.galaxyIntro.body}</span>
          </StoryBubble>
          <GamePanel className="game-panel-adventure">
            <p className="text-center text-sm leading-relaxed text-[var(--game-text-muted)]">
              {story.synopsis}
            </p>
          </GamePanel>
          <p className="text-center text-sm font-bold text-[var(--game-gold)]">
            {story.galaxyIntro.cta}
          </p>
        </div>
      )}

      {!showSeasonIntro && (
        <StoryBubble
          speaker={`${story.companion.name} · 故事進行中`}
          variant="intro"
          theme="adventure"
          className="mb-5"
        >
          {continueStory && continueAct ? (
            <>
              <span className="block text-xs text-[var(--game-text-muted)]">
                {continueAct.chapter} · {continueStory.beat}
              </span>
              <span className="mt-1 block">{story.synopsis}</span>
            </>
          ) : (
            story.synopsis
          )}
        </StoryBubble>
      )}

      <div className="mb-6 text-center">
        <p className="text-xs font-medium text-[var(--game-text-muted)]">
          {galaxy.emoji} {galaxy.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--game-text)]">
          選擇星球
        </h1>
        <p className="mt-1 text-xs text-[var(--game-text-muted)]">
          點選下方星球進入關卡地圖
        </p>
      </div>

      {!tableReady && (
        <GamePanel className="mb-5 border-amber-500/30">
          <p className="font-medium text-amber-200">關卡進度尚未啟用</p>
          <p className="mt-1 text-sm text-[var(--game-text-muted)]">
            請到 Supabase SQL Editor 執行{" "}
            <code className="text-xs">008_stage_progress_ascii.sql</code>
          </p>
        </GamePanel>
      )}

      {continueAt && tableReady && (
        <GameButton
          href={
            continueAt.kind === "paywall"
              ? `/pricing?next=/stage/${continueAt.stage.id}`
              : `/stage/${continueAt.stage.id}`
          }
          variant="gold"
          fullWidth
          className="mb-5"
        >
          <span className="block text-xs font-medium opacity-80">
            {continueAt.kind === "paywall" ? "✨ 訂閱解鎖" : "▶ 繼續冒險"}
          </span>
          <span className="block text-base">
            {continueAt.planet.icon} 第 {continueAt.stage.order} 關 ·{" "}
            {continueStory?.beat ?? continueAt.stage.name}
          </span>
        </GameButton>
      )}

      <div className="grid gap-3">
        {map.planets.map((planet) => {
          const unlocked = isPlanetUnlocked(planet, cleared, map.planets);
          const needsSubscription =
            planet.slug === "pattern" && unlocked && !isPaidPlan(plan);
          const clearedCount = planet.stages.filter((s) => cleared.has(s.id)).length;

          return (
            <PlanetCard
              key={planet.id}
              planet={planet}
              clearedCount={clearedCount}
              unlocked={unlocked}
              needsSubscription={needsSubscription}
              theme="space"
            />
          );
        })}
      </div>
    </>
  );
}
