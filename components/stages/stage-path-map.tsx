import Image from "next/image";
import type { CSSProperties } from "react";
import type { Planet, StageUnlockStatus } from "@/types/stage";
import { StageMapNode } from "@/components/stages/stage-map-node";
import { MapTreasureIcon } from "@/components/stages/map-icons";
import { ZoneSceneDecor } from "@/components/stages/zone-scene-decor";
import { getZoneArtConfig } from "@/lib/world/zone-assets";
import { getZoneTheme } from "@/lib/world/zone-themes";

const MAP_W = 360;
const ROW_H = 62;
const START_Y = 52;
const LEFT_X = 84;
const RIGHT_X = 276;
const NODE_R = 24;

type StageItem = {
  id: string;
  order: number;
  name: string;
  isBoss?: boolean;
  status: StageUnlockStatus;
};

interface StagePathMapProps {
  planet: Planet;
  zoneNum: number;
  zoneName: string;
  stages: StageItem[];
}

function nodePos(index: number) {
  return {
    x: index % 2 === 0 ? LEFT_X : RIGHT_X,
    y: START_Y + index * ROW_H,
  };
}

function segmentStyle(from: StageUnlockStatus) {
  if (from === "cleared") return "cleared";
  if (from === "available") return "current";
  return "locked";
}

function buildRoadPath(fromIndex: number, toIndex: number) {
  const a = nodePos(fromIndex);
  const b = nodePos(toIndex);
  const midY = (a.y + b.y) / 2;
  const bend = indexSide(fromIndex) === "left" ? 28 : -28;
  return `M ${a.x} ${a.y + NODE_R} C ${a.x + bend} ${midY}, ${b.x - bend} ${midY}, ${b.x} ${b.y - NODE_R}`;
}

function indexSide(index: number) {
  return index % 2 === 0 ? "left" : "right";
}

function isTreasureMilestone(index: number, total: number) {
  if (index === total - 1) return true;
  return index === 3 || index === 6;
}

function treasureCollected(stages: StageItem[], milestoneIndex: number) {
  const slice = stages.slice(0, milestoneIndex + 1);
  return slice.every((s) => s.status === "cleared");
}

function artNodePos(zoneNum: number, index: number) {
  const art = getZoneArtConfig(zoneNum);
  const node = art?.nodes[index];
  if (!node) return null;
  return { xPct: node.x, yPct: node.y };
}

export function StagePathMap({ planet, zoneNum, zoneName, stages }: StagePathMapProps) {
  const theme = getZoneTheme(zoneNum);
  const zoneArt = getZoneArtConfig(zoneNum);
  const useArt = zoneArt !== null;
  const clearedInZone = stages.filter((s) => s.status === "cleared").length;
  const mapH = START_Y + (stages.length - 1) * ROW_H + 64;

  const sceneStyle = {
    "--zone-sky-top": theme.skyTop,
    "--zone-sky-bottom": theme.skyBottom,
    "--zone-ground-top": theme.groundTop,
    "--zone-ground-bottom": theme.groundBottom,
    "--path-fill": theme.pathFill,
    "--path-edge": theme.pathEdge,
    "--path-highlight": theme.pathHighlight,
    "--zone-accent": theme.accent,
    ...(useArt ? {} : { height: mapH }),
  } as CSSProperties;

  const signStyle = {
    "--sign-wood": theme.signWood,
    "--sign-border": theme.signBorder,
    "--sign-accent": theme.accent,
  } as CSSProperties;

  return (
    <section className="map-zone-section">
      <div className="map-zone-sign" style={signStyle}>
        <div className="map-zone-sign-badge">W{zoneNum}</div>
        <div className="map-zone-sign-body">
          <p className="map-zone-sign-flavor">{theme.flavor}</p>
          <p className="map-zone-sign-name">{zoneName}</p>
        </div>
        <div className="map-zone-sign-meta">
          <span className="map-zone-sign-progress">
            {clearedInZone}/{stages.length} 已過關
          </span>
        </div>
      </div>

      <div
        className={useArt ? "map-zone-scene map-zone-scene--art" : "map-zone-scene"}
        style={sceneStyle}
      >
        {useArt && zoneArt && (
          <>
            <Image
              src={zoneArt.backgroundSrc}
              alt=""
              fill
              priority={zoneNum === 1}
              sizes="(max-width: 480px) 100vw, 420px"
              className="map-zone-scene-bg"
            />
            <div className="map-zone-scene-vignette" aria-hidden />
          </>
        )}

        {!useArt && <ZoneSceneDecor decor={theme.decor} sunColor={theme.sunColor} />}

        {!useArt && (
          <svg
            className="map-road-svg"
            viewBox={`0 0 ${MAP_W} ${mapH}`}
            preserveAspectRatio="xMidYMin meet"
            aria-hidden
          >
            {stages.slice(0, -1).map((stage, index) => {
              const d = buildRoadPath(index, index + 1);
              const style = segmentStyle(stage.status);
              return (
                <g key={`road-${stage.id}`}>
                  <path d={d} className="map-road-edge" />
                  <path d={d} className={`map-road-fill map-road-fill-${style}`} />
                  {style !== "locked" && (
                    <path d={d} className="map-road-dash" strokeDasharray="4 8" />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {stages.map((stage, index) => {
          const artPos = useArt ? artNodePos(zoneNum, index) : null;
          const gridPos = nodePos(index);
          const leftPct = artPos ? artPos.xPct : (gridPos.x / MAP_W) * 100;

          return (
            <div key={stage.id}>
              {isTreasureMilestone(index, stages.length) &&
                !(useArt && stage.isBoss) && (
                <div
                  className="map-treasure-anchor"
                  style={{
                    left: artPos
                      ? `calc(${leftPct}% + ${index % 2 === 0 ? -18 : 18}px)`
                      : `${leftPct}%`,
                    top: artPos
                      ? `calc(${artPos.yPct}% - 20px)`
                      : gridPos.y - 12,
                  }}
                >
                  <MapTreasureIcon
                    className="map-treasure-icon"
                    collected={treasureCollected(stages, index)}
                  />
                </div>
              )}
              <div
                className="map-node-anchor"
                style={{
                  left: `${leftPct}%`,
                  top: artPos ? `${artPos.yPct}%` : gridPos.y,
                }}
              >
                <StageMapNode
                  stageId={stage.id}
                  order={stage.order}
                  name={stage.name}
                  isBoss={stage.isBoss}
                  status={stage.status}
                  accentColor={planet.color}
                  artMode={useArt}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
