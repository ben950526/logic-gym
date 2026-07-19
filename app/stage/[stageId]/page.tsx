import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StagePuzzlePlayer } from "@/components/stages/stage-puzzle-player";
import { StageZoneHeader } from "@/components/stages/stage-zone-header";
import { MissionPrompt } from "@/components/story/mission-prompt";
import { ChapterBanner } from "@/components/story/chapter-banner";
import { StoryBubble } from "@/components/story/story-bubble";
import { GameShell } from "@/components/game/game-shell";
import { GameHud } from "@/components/game/game-hud";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import {
  getStageById,
  getStageStatus,
  isPlanetUnlocked,
  loadPlanetMap,
} from "@/lib/stages/planet-map";
import { getClearedStageIds } from "@/lib/stages/progress";
import { getPuzzleByTitle } from "@/lib/supabase/practice-puzzles";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import {
  getActForStage,
  getPlanetStory,
  getPreviousStageClearLine,
  getStageStory,
  loadSeasonStory,
} from "@/lib/story/season-1";
import { getMathStageStory, parseMathStageId } from "@/lib/story/math-zones";

export default async function StagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?next=/galaxy");
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/galaxy");
  }

  const { stageId } = await params;
  const stageInfo = await getStageById(stageId);
  if (!stageInfo) {
    notFound();
  }

  const [map, story, stageStory, planetStory, mathZoneStory, prevClearLine, cleared] =
    await Promise.all([
      loadPlanetMap(),
      loadSeasonStory(),
      getStageStory(stageId),
      getPlanetStory(stageInfo.planet.slug),
      parseMathStageId(stageId) ? getMathStageStory(stageId) : Promise.resolve(null),
      getPreviousStageClearLine(stageId),
      getClearedStageIds(session.userId),
    ]);
  const planetUnlocked = isPlanetUnlocked(
    stageInfo.planet,
    cleared,
    map.planets
  );
  const status = getStageStatus(
    stageInfo.planet,
    stageInfo.stage,
    cleared,
    planetUnlocked
  );

  if (status === "locked") {
    redirect(`/planet/${stageInfo.planet.slug}`);
  }

  const puzzle = await getPuzzleByTitle(stageInfo.stage.puzzleTitle);
  if (!puzzle) {
    return (
      <GameShell accent={stageInfo.planet.color} variant="adventure">
        <GameHud
          nickname={session.profile.nickname}
          backHref={`/planet/${stageInfo.planet.slug}`}
          backLabel={stageInfo.planet.name}
          variant="adventure"
        />
        <main className="stage-main px-3 pb-12 pt-3">
          <h1 className="stage-missing-title">題目尚未上架</h1>
          <p className="stage-missing-body">
            關卡「{stageInfo.stage.name}」需要題目「
            {stageInfo.stage.puzzleTitle}」在後台狀態為已上架。
          </p>
          <Link
            href={`/planet/${stageInfo.planet.slug}`}
            className="mt-6 inline-block text-sm text-indigo-300 hover:underline"
          >
            回星球地圖
          </Link>
        </main>
      </GameShell>
    );
  }

  const nextStage = stageInfo.planet.stages.find(
    (s) => s.order === stageInfo.stage.order + 1
  );
  const isBoss = stageInfo.stage.isBoss;
  const bossIntro =
    mathZoneStory?.bossIntro ??
    (isBoss && planetStory?.bossIntro ? planetStory.bossIntro : null);
  const act = getActForStage(stageId, story.acts);

  return (
    <GameShell accent={stageInfo.planet.color} variant="adventure">
      <GameHud
        nickname={session.profile.nickname}
        backHref={`/planet/${stageInfo.planet.slug}`}
        backLabel={stageInfo.planet.name}
        title={`第 ${stageInfo.stage.order} 關${isBoss ? " · BOSS" : ""}`}
        titleEmoji={stageInfo.planet.icon}
        variant="adventure"
      />
      <main className="stage-main px-3 pb-12 pt-3">
        {stageInfo.stage.zone != null && (
          <StageZoneHeader
            zoneNum={stageInfo.stage.zone}
            zoneName={stageInfo.stage.zoneName ?? `第 ${stageInfo.stage.zone} 區`}
            stageOrder={stageInfo.stage.order}
            isBoss={isBoss}
            className="mb-3"
          />
        )}

        {act && (
          <ChapterBanner act={act} beat={stageStory?.beat} theme="adventure" className="mb-3" />
        )}

        <h1 className="stage-title">{stageInfo.stage.name}</h1>

        {prevClearLine && (
          <StoryBubble speaker="上一段劇情" variant="default" theme="adventure" className="mb-3">
            {prevClearLine}
          </StoryBubble>
        )}

        {bossIntro && (
          <StoryBubble
            speaker={`${story.companion.name} · 警告`}
            variant="boss"
            theme="adventure"
            className="mb-3"
          >
            {bossIntro}
          </StoryBubble>
        )}

        {stageStory && (
          <StoryBubble
            speaker={story.protagonist.name}
            variant={isBoss ? "boss" : "intro"}
            theme="adventure"
            className="mb-3"
          >
            {stageStory.intro}
          </StoryBubble>
        )}

        {stageStory?.mission && (
          <MissionPrompt text={stageStory.mission} theme="adventure" className="mb-4" />
        )}

        <div className="stage-puzzle-shell stage-puzzle-shell--adventure">
          <StagePuzzlePlayer
            puzzle={puzzle}
            stageId={stageId}
            stageName={stageInfo.stage.name}
            planetSlug={stageInfo.planet.slug}
            isBoss={isBoss}
            alreadyCleared={status === "cleared"}
            nextStageId={nextStage?.id ?? null}
            clearLine={stageStory?.clear ?? null}
            companionName={story.companion.name}
            zoneClearLine={
              isBoss && mathZoneStory?.zoneCleared ? mathZoneStory.zoneCleared : null
            }
            theme="adventure"
          />
        </div>
      </main>
    </GameShell>
  );
}
