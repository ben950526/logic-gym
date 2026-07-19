import type { CSSProperties } from "react";
import { getZoneTheme } from "@/lib/world/zone-themes";
import { cn } from "@/lib/utils";

interface StageZoneHeaderProps {
  zoneNum: number;
  zoneName: string;
  stageOrder: number;
  isBoss?: boolean;
  className?: string;
}

export function StageZoneHeader({
  zoneNum,
  zoneName,
  stageOrder,
  isBoss,
  className,
}: StageZoneHeaderProps) {
  const theme = getZoneTheme(zoneNum);
  const signStyle = {
    "--sign-wood": theme.signWood,
    "--sign-border": theme.signBorder,
    "--sign-accent": theme.accent,
  } as CSSProperties;

  return (
    <div className={cn("map-zone-sign stage-zone-header", className)} style={signStyle}>
      <div className="map-zone-sign-badge">W{zoneNum}</div>
      <div className="map-zone-sign-body">
        <p className="map-zone-sign-flavor">{theme.flavor}</p>
        <p className="map-zone-sign-name">{zoneName}</p>
      </div>
      <div className="map-zone-sign-meta">
        <span className="map-zone-sign-progress">
          第 {stageOrder} 關{isBoss ? " · BOSS" : ""}
        </span>
      </div>
    </div>
  );
}
