"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { StageUnlockStatus } from "@/types/stage";
import { MapLockIcon } from "@/components/stages/map-icons";
import { cn } from "@/lib/utils";

interface StageMapNodeProps {
  stageId: string;
  order: number;
  name: string;
  isBoss?: boolean;
  status: StageUnlockStatus;
  accentColor: string;
  artMode?: boolean;
}

export function StageMapNode({
  stageId,
  order,
  name,
  isBoss,
  status,
  accentColor,
  artMode = false,
}: StageMapNodeProps) {
  const locked = status === "locked";
  const cleared = status === "cleared";
  const available = status === "available";

  const inner = (
    <div className={cn("map-node-stack", artMode && "map-node-stack--art")}>
      <div
        className={cn(
          "map-node-badge",
          isBoss && "map-node-badge-boss",
          cleared && "map-node-badge-cleared",
          available && "map-node-badge-current",
          locked && "map-node-badge-locked"
        )}
        style={
          available
            ? ({ "--node-accent": accentColor } as CSSProperties)
            : undefined
        }
      >
        <div className="map-node-badge-shine" aria-hidden />
        {locked ? (
          <MapLockIcon className="map-node-lock-icon" />
        ) : (
          <span className="map-node-num">{order}</span>
        )}
        {cleared && (
          <span className="map-node-cleared-mark" aria-label="已過關">
            ✓
          </span>
        )}
        {isBoss && !locked && <span className="map-node-boss-tag">BOSS</span>}
      </div>

      {(available || isBoss || cleared) && !artMode && (
        <p className={cn("map-node-name", available && "map-node-name-current")}>
          {name}
        </p>
      )}
    </div>
  );

  if (locked) {
    return (
      <div className="map-node-link" aria-label={`第 ${order} 關 · ${name}（未解鎖）`}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/stage/${stageId}`}
      className="map-node-link"
      aria-label={artMode ? `第 ${order} 關 · ${name}` : undefined}
    >
      {inner}
    </Link>
  );
}
