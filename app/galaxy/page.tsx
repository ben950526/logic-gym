import { redirect } from "next/navigation";
import { PlanetCard } from "@/components/stages/planet-card";
import { CharacterCompanion } from "@/components/story/character-companion";
import { StoryBubble } from "@/components/story/story-bubble";
import { GameShell } from "@/components/game/game-shell";
import { GameHud } from "@/components/game/game-hud";
import { GamePanel } from "@/components/game/game-panel";
import { GameButton } from "@/components/game/game-button";
import { SHELL_ASSETS } from "@/lib/world/shell-assets";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import {
  getStageStatus,
  isPlanetUnlocked,
  loadPlanetMap,
} from "@/lib/stages/planet-map";
import {
  getClearedStageIds,
  isStageProgressTableReady,
} from "@/lib/stages/progress";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import { MATH_PLANET_NAME } from "@/lib/world/planet-names";
import {
  getCharacterTier,
  getActForStage,
  getStageStory,
  loadSeasonStory,
} from "@/lib/story/season-1";

function findContinueStage(
  planets: Awaited<ReturnType<typeof loadPlanetMap>>["planets"],
  cleared: Set<string>
) {
  for (const planet of planets) {
    const unlocked = isPlanetUnlocked(planet, cleared, planets);
    if (!unlocked) continue;

    for (const stage of planet.stages) {
      const status = getStageStatus(planet, stage, cleared, unlocked);
      if (status === "available") {
        return { planet, stage };
      }
    }
  }
  return null;
}

export default async function GalaxyPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?next=/galaxy");
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/galaxy");
  }

  const [map, story, cleared] = await Promise.all([
    loadPlanetMap(),
    loadSeasonStory(),
    getClearedStageIds(session.userId),
  ]);
  const tableReady = await isStageProgressTableReady();
  const totalStages = map.planets.reduce((n, p) => n + p.stages.length, 0);
  const clearedTotal = map.planets.reduce(
    (n, p) => n + p.stages.filter((s) => cleared.has(s.id)).length,
    0
  );
  const continueAt = findContinueStage(map.planets, cleared);
  const tier = getCharacterTier(clearedTotal, story.characterTiers);
  const showSeasonIntro = clearedTotal === 0;
  const continueStory = continueAt
    ? await getStageStory(continueAt.stage.id)
    : null;
  const continueAct = continueAt
    ? getActForStage(continueAt.stage.id, story.acts)
    : null;

  return (
    <GameShell backgroundSrc={SHELL_ASSETS.galaxyBg}>
      <GameHud
        nickname={session.profile.nickname}
        title={map.galaxy.name}
        titleEmoji="🌌"
        progress={{ current: clearedTotal, total: totalStages }}
      />
      <main className="px-4 pb-10 pt-4">
        <div className="mb-5">
          <CharacterCompanion
            tier={tier}
            protagonistName={story.protagonist.name}
            companionName={story.companion.name}
            clearedCount={clearedTotal}
            totalStages={totalStages}
          />
        </div>

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

        <div className="mb-5 text-center">
          <GameButton href="/story/math-planet" variant="ghost">
            📖 {MATH_PLANET_NAME} · 完整劇情
          </GameButton>
        </div>

        <div className="mb-6 text-center">
          <p className="text-xs font-medium text-[var(--game-text-muted)]">
            {story.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--game-text)]">
            選擇星球出發
          </h1>
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
            href={`/stage/${continueAt.stage.id}`}
            variant="gold"
            fullWidth
            className="mb-5"
          >
            <span className="block text-xs font-medium opacity-80">▶ 繼續冒險</span>
            <span className="block text-base">
              {continueAt.planet.icon} 第 {continueAt.stage.order} 關 ·{" "}
              {continueStory?.beat ?? continueAt.stage.name}
            </span>
          </GameButton>
        )}

        <div className="grid gap-3">
          {map.planets.map((planet) => {
            const unlocked = isPlanetUnlocked(planet, cleared, map.planets);
            const clearedCount = planet.stages.filter((s) =>
              cleared.has(s.id)
            ).length;

            return (
              <PlanetCard
                key={planet.id}
                planet={planet}
                clearedCount={clearedCount}
                unlocked={unlocked}
                theme="space"
              />
            );
          })}
        </div>
      </main>
    </GameShell>
  );
}
