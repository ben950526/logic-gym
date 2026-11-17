import { CharacterCompanion } from "@/components/story/character-companion";
import { HomeDepartSection } from "@/components/home/home-depart-section";
import { SubscriptionPromoCard } from "@/components/home/subscription-promo-card";
import { GameShell } from "@/components/game/game-shell";
import { GameHud } from "@/components/game/game-hud";
import { SHELL_ASSETS } from "@/lib/world/shell-assets";
import { findContinueStageFromMap } from "@/lib/stages/continue-stage";
import { loadPlanetMap } from "@/lib/stages/planet-map";
import { getClearedStageIds } from "@/lib/stages/progress";
import { getCharacterTier, loadSeasonStory } from "@/lib/story/season-1";
import { isPaidPlan } from "@/lib/stage-access";
import { getSubscriptionHomeHint } from "@/lib/pricing-content";
import type { UserProfile } from "@/types/user";

interface PlayerHomeDashboardProps {
  profile: UserProfile;
  userId: string;
}

export async function PlayerHomeDashboard({
  profile,
  userId,
}: PlayerHomeDashboardProps) {
  const [map, story, cleared] = await Promise.all([
    loadPlanetMap(),
    loadSeasonStory(),
    getClearedStageIds(userId),
  ]);

  const totalStages = map.planets.reduce((n, p) => n + p.stages.length, 0);
  const clearedTotal = map.planets.reduce(
    (n, p) => n + p.stages.filter((s) => cleared.has(s.id)).length,
    0
  );
  const mathPlanet = map.planets.find((p) => p.slug === "math")!;
  const mathCleared = mathPlanet.stages.filter((s) => cleared.has(s.id)).length;
  const continueAt = findContinueStageFromMap(map.planets, cleared, profile.plan);
  const atPaywall = continueAt?.kind === "paywall";
  const tier = getCharacterTier(clearedTotal, story.characterTiers);
  const paid = isPaidPlan(profile.plan);

  return (
    <GameShell backgroundSrc={SHELL_ASSETS.galaxyBg}>
      <GameHud nickname={profile.nickname} title="Logic Gym 首頁" titleEmoji="🏠" />

      <main className="player-home px-4 pb-12 pt-4">
        <section className="player-home-xiaoguang">
          <CharacterCompanion
            tier={tier}
            protagonistName={story.protagonist.name}
            companionName={story.companion.name}
            clearedCount={clearedTotal}
            totalStages={totalStages}
          />
        </section>

        <HomeDepartSection />

        <section className="player-home-subscription">
          <h2 className="player-home-section-title">訂閱區</h2>
          {!paid && (
            <p className="player-home-subscription-hint">
              {getSubscriptionHomeHint(atPaywall, mathCleared)}
            </p>
          )}
          <SubscriptionPromoCard
            plan={profile.plan}
            mathCleared={mathCleared}
            atPaywall={atPaywall}
          />
        </section>
      </main>
    </GameShell>
  );
}
