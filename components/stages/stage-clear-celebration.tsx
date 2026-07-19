"use client";

import { cn } from "@/lib/utils";

interface StageClearCelebrationProps {
  stageName: string;
  isBoss?: boolean;
  planetCleared?: boolean;
  clearLine?: string | null;
  companionName?: string;
  zoneClearLine?: string | null;
}

export function StageClearCelebration({
  stageName,
  isBoss,
  planetCleared,
  clearLine,
  companionName,
  zoneClearLine,
}: StageClearCelebrationProps) {
  return (
    <div className="stage-clear-celebration" role="status">
      <div className="stage-clear-celebration-stars" aria-hidden>
        {["✦", "★", "✧", "⭐", "✦"].map((star, i) => (
          <span
            key={i}
            className={cn(
              "stage-clear-celebration-star",
              i === 0 && "stage-clear-celebration-star--0",
              i === 1 && "stage-clear-celebration-star--1",
              i === 2 && "stage-clear-celebration-star--2",
              i === 3 && "stage-clear-celebration-star--3",
              i === 4 && "stage-clear-celebration-star--4"
            )}
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {star}
          </span>
        ))}
      </div>

      <p className="stage-clear-celebration-kicker">
        {planetCleared ? "Planet Clear" : isBoss ? "Boss Clear" : "Stage Clear"}
      </p>
      <p className="stage-clear-celebration-headline">
        {planetCleared ? "星球通關！" : isBoss ? "BOSS 擊破！" : "關卡突破！"}
      </p>
      <p className="stage-clear-celebration-stage">{stageName}</p>
      {clearLine && (
        <p className="stage-clear-celebration-line">
          {companionName && (
            <span className="stage-clear-celebration-speaker">{companionName}</span>
          )}
          {clearLine}
        </p>
      )}
      {zoneClearLine && (
        <p className="stage-clear-celebration-zone">
          🎉 大區通關！
          <span className="stage-clear-celebration-zone-text">{zoneClearLine}</span>
        </p>
      )}
      <p className="stage-clear-celebration-foot">
        {planetCleared
          ? "新星球已解鎖，回星系看看！"
          : "下一關已解鎖，繼續衝！"}
      </p>
    </div>
  );
}
