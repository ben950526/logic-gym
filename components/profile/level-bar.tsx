import { getLevelProgress } from "@/lib/exp";
import { cn } from "@/lib/utils";

interface LevelBarProps {
  level: number;
  exp: number;
  className?: string;
  compact?: boolean;
}

export function LevelBar({
  level,
  exp,
  className,
  compact = false,
}: LevelBarProps) {
  const { expRequired, expPercent } = getLevelProgress(level, exp);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-blue-700">Lv.{level}</span>
        {!compact && (
          <span className="text-zinc-500">
            {exp} / {expRequired} EXP
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${expPercent}%` }}
        />
      </div>
    </div>
  );
}
