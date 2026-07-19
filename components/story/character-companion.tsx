import Image from "next/image";
import type { CharacterTier } from "@/lib/story/season-1";
import { SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface CharacterCompanionProps {
  tier: CharacterTier;
  protagonistName: string;
  companionName: string;
  clearedCount: number;
  totalStages: number;
  compact?: boolean;
  /** MJ 主角頭像；預設使用 shell/portrait-xiaoguang.png */
  portraitSrc?: string | null;
}

export function CharacterCompanion({
  tier,
  protagonistName,
  companionName,
  clearedCount,
  totalStages,
  compact = false,
  portraitSrc = SHELL_ASSETS.portraitXiaoguang,
}: CharacterCompanionProps) {
  const usePortrait = Boolean(portraitSrc);
  const pct = totalStages ? (clearedCount / totalStages) * 100 : 0;

  return (
    <div
      className={cn(
        "companion-card",
        usePortrait && "companion-card--art",
        compact && "companion-card--compact"
      )}
    >
      <div
        className={cn(
          "companion-portrait",
          compact && "companion-portrait--compact"
        )}
      >
        {usePortrait && portraitSrc ? (
          <Image
            src={portraitSrc}
            alt={protagonistName}
            width={compact ? 56 : 72}
            height={compact ? 56 : 72}
            className="companion-portrait-img"
          />
        ) : (
          <span role="img" aria-label={tier.title} className="companion-portrait-emoji">
            {tier.emoji}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("companion-name", compact && "companion-name--compact")}>
          {protagonistName}
          <span className="companion-tier">{tier.title}</span>
        </p>
        <p className={cn("companion-meta", compact && "companion-meta--compact")}>
          夥伴 {companionName} · 已修復 {clearedCount}/{totalStages} 關
        </p>
        <div className="companion-progress-track">
          <div className="companion-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
