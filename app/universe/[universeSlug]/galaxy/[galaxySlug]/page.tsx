import { notFound, redirect } from "next/navigation";

import { GameHud } from "@/components/game/game-hud";

import { GameShell } from "@/components/game/game-shell";

import { UniversePlanetsView } from "@/components/world/universe-planets-view";

import { getCurrentUserProfile } from "@/lib/daily-limit";

import { isSupabaseConfigured } from "@/lib/puzzles-local";

import { SHELL_ASSETS } from "@/lib/world/shell-assets";

import { getUniverseBySlug } from "@/lib/world/universes";

import { getGalaxyInUniverse } from "@/lib/world/world-catalog";



export default async function UniverseGalaxyPage({

  params,

}: {

  params: Promise<{ universeSlug: string; galaxySlug: string }>;

}) {

  const { universeSlug, galaxySlug } = await params;



  if (!isSupabaseConfigured()) {

    redirect(`/login?next=/universe/${universeSlug}/galaxy/${galaxySlug}`);

  }



  const session = await getCurrentUserProfile();

  if (!session) {

    redirect(`/login?next=/universe/${universeSlug}/galaxy/${galaxySlug}`);

  }



  const universe = getUniverseBySlug(universeSlug);

  if (!universe) {

    notFound();

  }



  const galaxy = getGalaxyInUniverse(universeSlug, galaxySlug);

  if (!galaxy || galaxy.planets.length === 0) {

    notFound();

  }



  return (

    <GameShell backgroundSrc={SHELL_ASSETS.galaxyBg}>

      <GameHud

        nickname={session.profile.nickname}

        backHref={`/universe/${universeSlug}`}

        backLabel={universe.name}

        title={galaxy.theme.name}

        titleEmoji={galaxy.theme.emoji}

      />

      <main className="world-page px-4 pb-10 pt-4">

        <UniversePlanetsView

          universe={universe}

          galaxy={galaxy}

          userId={session.userId}

          plan={session.profile.plan}

        />

      </main>

    </GameShell>

  );

}

