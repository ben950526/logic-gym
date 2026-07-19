import { notFound, redirect } from "next/navigation";
import { StagePath } from "@/components/stages/stage-path";
import { StoryBubble } from "@/components/story/story-bubble";
import { GameShell } from "@/components/game/game-shell";
import { GameHud } from "@/components/game/game-hud";
import { GameButton } from "@/components/game/game-button";
import { GamePanel } from "@/components/game/game-panel";
import { ChapterBanner } from "@/components/story/chapter-banner";
import { PlanetExpeditionHeader } from "@/components/planet/planet-expedition-header";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import {
  getPlanetBySlug,
  getStageStatus,
  isPlanetUnlocked,
  loadPlanetMap,
} from "@/lib/stages/planet-map";
import { getClearedStageIds } from "@/lib/stages/progress";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import { MATH_PLANET_NAME, PATTERN_PLANET_NAME } from "@/lib/world/planet-names";
import { getPlanetAct, getPlanetStory, loadSeasonStory } from "@/lib/story/season-1";

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?next=/galaxy");
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/galaxy");
  }

  const { slug } = await params;
  const planet = await getPlanetBySlug(slug);
  if (!planet) {
    notFound();
  }

  const [map, story, planetStory, cleared] = await Promise.all([
    loadPlanetMap(),
    loadSeasonStory(),
    getPlanetStory(slug),
    getClearedStageIds(session.userId),
  ]);
  const unlocked = isPlanetUnlocked(planet, cleared, map.planets);

  if (!unlocked) {
    const mathPlanet = map.planets.find((p) => p.slug === "math");
    const mathCleared =
      mathPlanet?.stages.filter((s) => cleared.has(s.id)).length ?? 0;
    const mathTotal = mathPlanet?.stages.length ?? 8;
    const act2 = story.acts.find((a) => a.id === "act2");

    return (
      <GameShell accent={planet.color} variant="adventure">
        <GameHud
          nickname={session.profile.nickname}
          backHref="/galaxy"
          backLabel="邏輯星系"
          variant="adventure"
        />
        <main className="px-4 py-10 text-center">
          <p className="text-5xl">{planet.icon}</p>
          <h1 className="mt-4 text-2xl font-bold text-[var(--adv-text)]">{planet.name}</h1>
          {act2 && <ChapterBanner act={act2} theme="adventure" className="mt-6 text-left" />}
          <StoryBubble
            speaker={`${story.companion.name} · 星艦日誌`}
            variant="intro"
            theme="adventure"
            className="mt-4 text-left"
          >
            日誌寫：「通關{MATH_PLANET_NAME} 100 關，{PATTERN_PLANET_NAME}才會開啟。」你還沒完成遠征！
          </StoryBubble>
          <GamePanel className="game-panel-adventure mt-6">
            <p className="text-sm text-[var(--adv-text-muted)]">
              先通關「{mathPlanet?.name ?? MATH_PLANET_NAME}」全部 {mathTotal} 關才能解鎖。
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--adv-text)]">
              目前進度 {mathCleared} / {mathTotal} 關
            </p>
          </GamePanel>
          <div className="mt-6">
            <GameButton href="/galaxy" variant="primary">
              回邏輯星系
            </GameButton>
          </div>
        </main>
      </GameShell>
    );
  }

  const stageStatuses = planet.stages.map((stage) => ({
    id: stage.id,
    order: stage.order,
    name: stage.name,
    zone: stage.zone,
    zoneName: stage.zoneName,
    isBoss: stage.isBoss,
    status: getStageStatus(planet, stage, cleared, unlocked),
  }));

  const clearedCount = stageStatuses.filter((s) => s.status === "cleared").length;
  const currentStage = stageStatuses.find((s) => s.status === "available");
  const planetComplete = clearedCount === planet.stages.length;
  const planetAct = getPlanetAct(slug, story.acts);
  const showPlanetIntro = clearedCount === 0 && planetStory;

  return (
    <GameShell accent={planet.color} variant="adventure">
      <GameHud
        nickname={session.profile.nickname}
        backHref="/galaxy"
        backLabel="邏輯星系"
        title={planet.name}
        titleEmoji={planet.icon}
        progress={{ current: clearedCount, total: planet.stages.length }}
        variant="adventure"
      />
      <main className="expedition-main px-3 pb-12 pt-3">
        <PlanetExpeditionHeader
          planet={planet}
          clearedCount={clearedCount}
          totalStages={planet.stages.length}
          currentStage={currentStage ?? null}
        />

        {planetAct && (
          <ChapterBanner act={planetAct} theme="adventure" className="mb-4 mt-4" />
        )}

        {showPlanetIntro && (
          <StoryBubble speaker={story.companion.name} variant="intro" theme="adventure" className="mb-4">
            {planetStory.intro}
          </StoryBubble>
        )}

        {planetComplete && planetStory && (
          <StoryBubble speaker={story.protagonist.name} variant="clear" theme="adventure" className="mb-4">
            {planetStory.cleared}
          </StoryBubble>
        )}

        <div className="map-world-scroll">
          <StagePath planet={planet} stageStatuses={stageStatuses} theme="game" />
        </div>
      </main>
    </GameShell>
  );
}
