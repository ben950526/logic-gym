import Link from "next/link";

import { listUniversesSorted } from "@/lib/world/universes";

import { buildUniverseHref } from "@/lib/world/world-catalog";

import { cn } from "@/lib/utils";



interface UniversePickerGridProps {

  className?: string;

}



export function UniversePickerGrid({ className }: UniversePickerGridProps) {

  const universes = listUniversesSorted();



  return (

    <div className={cn("player-home-universe-grid", className)}>

      {universes.map((universe) => (

        <Link

          key={universe.slug}

          href={buildUniverseHref(universe.slug)}

          className={cn(

            "player-home-universe-btn",

            universe.playable && "player-home-universe-btn--active",

            !universe.playable && "player-home-universe-btn--soon"

          )}

        >

          <span className="player-home-universe-btn-emoji">{universe.emoji}</span>

          <span className="player-home-universe-btn-name">{universe.name}</span>

          <span className="player-home-universe-btn-age">{universe.ageLabel}</span>

          <span className="player-home-universe-btn-desc">

            {universe.playable ? universe.tagline : "內容建置中"}

          </span>

        </Link>

      ))}

    </div>

  );

}

