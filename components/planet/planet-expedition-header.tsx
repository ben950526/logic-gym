import type { CSSProperties } from "react";
import type { Planet } from "@/types/stage";
import { GameButton } from "@/components/game/game-button";
import { ShellArtPanel } from "@/components/game/shell-art-panel";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";

interface PlanetExpeditionHeaderProps {
  planet: Planet;
  clearedCount: number;
  totalStages: number;
  currentStage?: {
    id: string;
    order: number;
    name: string;
    isBoss?: boolean;
  } | null;
}

export function PlanetExpeditionHeader({
  planet,
  clearedCount,
  totalStages,
  currentStage,
}: PlanetExpeditionHeaderProps) {
  const pct = totalStages ? Math.round((clearedCount / totalStages) * 100) : 0;

  const artStyle = {
    ["--planet-accent" as string]: planet.color,
  } as CSSProperties;

  return (
    <ShellArtPanel
      src={SHELL_ASSETS.panelExpedition}
      layout={SHELL_ART_LAYOUT.panelExpedition}
      className="expedition-header expedition-header--art"
      contentClassName="expedition-header__content"
      style={artStyle}
    >
      <p className="expedition-header-sub">{planet.subtitle}</p>
      <h1 className="expedition-header-title">{planet.name}</h1>
      <div className="expedition-header-progress">
        <div className="expedition-progress-track">
          <div
            className="expedition-progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="expedition-progress-label">
          遠征 {clearedCount}/{totalStages} 關 · {pct}%
        </span>
      </div>

      {currentStage && (
        <GameButton
          href={`/stage/${currentStage.id}`}
          variant="gold"
          fullWidth
          className="expedition-continue-btn"
        >
          <span className="expedition-continue-kicker">繼續遠征</span>
          <span className="expedition-continue-title">
            第 {currentStage.order} 關 · {currentStage.name}
            {currentStage.isBoss ? " ⚔" : ""}
          </span>
        </GameButton>
      )}
    </ShellArtPanel>
  );
}
