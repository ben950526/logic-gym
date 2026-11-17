import type { PlanetCatalogEntry } from "@/lib/world/world-catalog";

import { cn } from "@/lib/utils";



interface CatalogPlanetCardProps {

  entry: PlanetCatalogEntry;

}



export function CatalogPlanetCard({ entry }: CatalogPlanetCardProps) {

  return (

    <div

      className={cn(

        "catalog-planet-card",

        entry.playable ? "catalog-planet-card--ready" : "catalog-planet-card--soon"

      )}

      style={{ borderTopColor: entry.color }}

    >

      <div className="catalog-planet-card-head">

        <span className="catalog-planet-card-icon">{entry.icon}</span>

        <div className="min-w-0 flex-1">

          <h2 className="catalog-planet-card-name">{entry.name}</h2>

          <p className="catalog-planet-card-sub">{entry.subtitle}</p>

        </div>

        <span className="catalog-planet-card-badge">

          {entry.playable ? "可遠征" : "建置中"}

        </span>

      </div>

      {entry.comingSoonNote && (

        <p className="catalog-planet-card-note">{entry.comingSoonNote}</p>

      )}

    </div>

  );

}

