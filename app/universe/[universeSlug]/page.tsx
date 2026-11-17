import { notFound, redirect } from "next/navigation";

import { GameHud } from "@/components/game/game-hud";

import { GameShell } from "@/components/game/game-shell";

import { GamePanel } from "@/components/game/game-panel";

import { UniverseGalaxyGrid } from "@/components/world/universe-galaxy-grid";

import { getCurrentUserProfile } from "@/lib/daily-limit";

import { isSupabaseConfigured } from "@/lib/puzzles-local";

import { SHELL_ASSETS } from "@/lib/world/shell-assets";

import { getUniverseBySlug } from "@/lib/world/universes";



export default async function UniverseSlugPage({

  params,

}: {

  params: Promise<{ universeSlug: string }>;

}) {

  const { universeSlug } = await params;



  if (!isSupabaseConfigured()) {

    redirect(`/login?next=/universe/${universeSlug}`);

  }



  const session = await getCurrentUserProfile();

  if (!session) {

    redirect(`/login?next=/universe/${universeSlug}`);

  }



  const universe = getUniverseBySlug(universeSlug);

  if (!universe) {

    notFound();

  }



  return (

    <GameShell backgroundSrc={SHELL_ASSETS.galaxyBg}>

      <GameHud

        nickname={session.profile.nickname}

        backHref="/"

        backLabel="首頁"

        title={universe.name}

        titleEmoji={universe.emoji}

      />

      <main className="world-page px-4 pb-10 pt-4">

        <GamePanel className="game-panel-adventure membership-card world-universe-hero mb-5">

          <p className="membership-card__kicker">{universe.ageLabel} · {universe.ageRange}</p>

          <h1 className="membership-card__heading">{universe.name}</h1>

          <p className="membership-card__body">{universe.parentPitch}</p>

          <p className="membership-card__muted">{universe.tagline}</p>

        </GamePanel>



        <h2 className="player-home-section-title">選擇星系</h2>

        <p className="player-home-depart-hint mb-3">依主題挑選想探索的方向</p>

        <UniverseGalaxyGrid universe={universe} />

      </main>

    </GameShell>

  );

}

