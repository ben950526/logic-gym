import Image from "next/image";
import Link from "next/link";
import type { Planet } from "@/types/stage";
import { getPlanetShellArt } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface PlanetCardProps {
  planet: Planet;
  clearedCount: number;
  unlocked: boolean;
  theme?: "light" | "space";
}

export function PlanetCard({
  planet,
  clearedCount,
  unlocked,
  theme = "space",
}: PlanetCardProps) {
  const total = planet.stages.length;
  const done = clearedCount >= total;
  const isSpace = theme === "space";
  const pct = total ? (clearedCount / total) * 100 : 0;
  const artSrc = isSpace ? getPlanetShellArt(planet.slug) : null;
  const useArt = artSrc !== null;

  const body = useArt ? (
    <div
      className={cn(
        "planet-card-space planet-card-space--art",
        !unlocked && "planet-card-space-locked"
      )}
    >
      <div className="planet-card-art-scene">
        <Image
          src={artSrc}
          alt=""
          fill
          sizes="(max-width: 430px) 100vw, 420px"
          className="planet-card-art-img"
        />
        <div className="planet-card-art-vignette" aria-hidden />
        {!unlocked && (
          <span className="planet-card-art-badge planet-card-art-badge-lock">
            未解鎖
          </span>
        )}
        {done && unlocked && (
          <span className="planet-card-art-badge planet-card-art-badge-done">
            通關
          </span>
        )}
      </div>
      <div className="planet-card-art-footer">
        <h2 className="planet-card-art-title">{planet.name}</h2>
        <p className="planet-card-art-sub">{planet.subtitle}</p>
        <p className="planet-card-art-progress-label">
          已過 {clearedCount} / {total} 關
        </p>
        <div className="planet-card-art-progress-track">
          <div
            className="planet-card-art-progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  ) : (
    <div
      className={cn(
        "relative overflow-hidden p-5 text-left transition",
        isSpace
          ? cn(
              "planet-card-space",
              !unlocked && "planet-card-space-locked"
            )
          : cn(
              "rounded-2xl border p-6",
              unlocked
                ? "border-zinc-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md"
                : "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-70"
            )
      )}
      style={
        unlocked && isSpace
          ? { borderTopColor: planet.color, borderTopWidth: 3 }
          : unlocked && !isSpace
            ? { borderTopColor: planet.color, borderTopWidth: 4 }
            : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl">{planet.icon}</p>
          <h2
            className={cn(
              "mt-2 text-lg font-bold",
              isSpace ? "text-[var(--game-text)]" : "text-zinc-900"
            )}
          >
            {planet.name}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm",
              isSpace ? "text-[var(--game-text-muted)]" : "text-zinc-600"
            )}
          >
            {planet.subtitle}
          </p>
        </div>
        {!unlocked && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              isSpace
                ? "bg-white/10 text-[var(--game-text-muted)]"
                : "bg-zinc-200 text-zinc-600"
            )}
          >
            未解鎖
          </span>
        )}
        {done && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              isSpace
                ? "bg-green-500/20 text-green-300"
                : "bg-green-100 text-green-800"
            )}
          >
            通關
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-4 text-xs",
          isSpace ? "text-[var(--game-text-muted)]" : "text-zinc-500"
        )}
      >
        已過 {clearedCount} / {total} 關
      </p>
      <div
        className={cn(
          "mt-2 h-1.5 overflow-hidden rounded-full",
          isSpace ? "bg-white/10" : "bg-zinc-100"
        )}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: planet.color }}
        />
      </div>
    </div>
  );

  if (!unlocked) {
    return body;
  }

  return (
    <Link href={`/planet/${planet.slug}`} className="planet-card-link">
      {body}
    </Link>
  );
}
