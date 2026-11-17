import { redirect } from "next/navigation";
import { GameHud } from "@/components/game/game-hud";
import { GameShell } from "@/components/game/game-shell";
import { MembershipHub } from "@/components/pricing/membership-hub";
import { SHELL_ASSETS } from "@/lib/world/shell-assets";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { isPaidPlan } from "@/lib/stage-access";
import { loadPlanetMap } from "@/lib/stages/planet-map";
import { getClearedStageIds } from "@/lib/stages/progress";
import { isSupabaseConfigured } from "@/lib/puzzles-local";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login?next=/pricing");
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/pricing");
  }

  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") ? params.next : null;

  const [map, cleared] = await Promise.all([
    loadPlanetMap(),
    getClearedStageIds(session.userId),
  ]);
  const mathPlanet = map.planets.find((p) => p.slug === "math")!;
  const mathCleared = mathPlanet.stages.filter((s) => cleared.has(s.id)).length;
  const paid = isPaidPlan(session.profile.plan);

  return (
    <GameShell backgroundSrc={SHELL_ASSETS.galaxyBg}>
      <GameHud
        nickname={session.profile.nickname}
        backHref="/"
        backLabel="首頁"
        title={paid ? "會員中心" : "訂閱方案"}
        titleEmoji={paid ? "✦" : "✨"}
      />
      <main className="membership-page px-4 pb-12 pt-4">
        <MembershipHub
          nickname={session.profile.nickname}
          plan={session.profile.plan}
          mathCleared={mathCleared}
          nextHref={next}
          backHref="/"
          backLabel="首頁"
          variant="full"
        />
      </main>
    </GameShell>
  );
}
