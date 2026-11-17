import Link from "next/link";

import { getGalaxiesForUniverse } from "@/lib/world/world-catalog";

import type { UniverseEntry } from "@/lib/world/universes";

import { cn } from "@/lib/utils";



interface UniverseGalaxyGridProps {

  universe: UniverseEntry;

}



export function UniverseGalaxyGrid({ universe }: UniverseGalaxyGridProps) {

  const galaxies = getGalaxiesForUniverse(universe.slug);



  return (

    <div className="player-home-galaxy-grid">

      {galaxies.map(({ theme, playable, planets }) => {

        const hasPlanets = planets.length > 0;

        const href = `/universe/${universe.slug}/galaxy/${theme.slug}`;



        if (!hasPlanets) {

          return (

            <div

              key={theme.slug}

              className="player-home-galaxy-btn player-home-galaxy-btn--soon player-home-galaxy-btn--static"

            >

              <span className="player-home-galaxy-btn-emoji">{theme.emoji}</span>

              <span className="player-home-galaxy-btn-name">{theme.name}</span>

              <span className="player-home-galaxy-btn-desc">即將開放</span>

            </div>

          );

        }



        return (

          <Link

            key={theme.slug}

            href={href}

            className={cn(

              "player-home-galaxy-btn",

              playable && "player-home-galaxy-btn--active",

              !playable && "player-home-galaxy-btn--soon"

            )}

          >

            <span className="player-home-galaxy-btn-emoji">{theme.emoji}</span>

            <span className="player-home-galaxy-btn-name">{theme.name}</span>

            <span className="player-home-galaxy-btn-desc">

              {playable ? theme.tagline : planets.length > 0 ? "建置中" : "即將開放"}

            </span>

          </Link>

        );

      })}

    </div>

  );

}

