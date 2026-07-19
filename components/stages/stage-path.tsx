import Link from "next/link";
import type { Planet, StageUnlockStatus } from "@/types/stage";
import { cn } from "@/lib/utils";
import { StagePathMap } from "@/components/stages/stage-path-map";

interface StagePathProps {
  planet: Planet;
  stageStatuses: Array<{
    id: string;
    order: number;
    name: string;
    zone?: number;
    zoneName?: string;
    isBoss?: boolean;
    status: StageUnlockStatus;
  }>;
  theme?: "light" | "game";
}

export function StagePath({
  planet,
  stageStatuses,
  theme = "game",
}: StagePathProps) {
  const zones = new Map<number, { name: string; stages: typeof stageStatuses }>();

  for (const stage of stageStatuses) {
    const z = stage.zone ?? 1;
    const name = stage.zoneName ?? `第 ${z} 區`;
    if (!zones.has(z)) zones.set(z, { name, stages: [] });
    zones.get(z)!.stages.push(stage);
  }

  const zoneList = [...zones.entries()].sort(([a], [b]) => a - b);

  if (theme !== "game") {
    return <StagePathList planet={planet} zoneList={zoneList} />;
  }

  return (
    <div className="space-y-6">
      {zoneList.map(([zoneNum, { name, stages }]) => (
        <StagePathMap
          key={zoneNum}
          planet={planet}
          zoneNum={zoneNum}
          zoneName={name}
          stages={stages}
        />
      ))}
    </div>
  );
}

function StagePathList({
  planet,
  zoneList,
}: {
  planet: Planet;
  zoneList: [number, { name: string; stages: StagePathProps["stageStatuses"] }][];
}) {
  return (
    <div className="space-y-8">
      {zoneList.map(([zoneNum, { name, stages }]) => {
        const clearedInZone = stages.filter((s) => s.status === "cleared").length;
        return (
          <section key={zoneNum}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-700">
                第 {zoneNum} 區 · {name}
              </h2>
              <span className="text-xs text-zinc-500">
                {clearedInZone}/{stages.length}
              </span>
            </div>
            <ol className="space-y-3">
              {stages.map((stage) => {
                const clickable = stage.status !== "locked";
                const row = (
                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-xl border px-4 py-3",
                      stage.status === "cleared" && "border-green-200 bg-green-50/80",
                      stage.status === "available" && "border-blue-200 bg-blue-50/50",
                      stage.status === "locked" && "border-zinc-200 bg-zinc-50 opacity-60"
                    )}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={
                        stage.status === "available"
                          ? { backgroundColor: planet.color }
                          : undefined
                      }
                    >
                      {stage.status === "locked" ? "🔒" : stage.order}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{stage.name}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={stage.id}>
                    {clickable ? (
                      <Link href={`/stage/${stage.id}`} className="block">
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
