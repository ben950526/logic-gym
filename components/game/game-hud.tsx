import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

interface GameHudProps {
  nickname?: string;
  title?: string;
  titleEmoji?: string;
  backHref?: string;
  backLabel?: string;
  progress?: { current: number; total: number };
  variant?: "space" | "adventure";
}

export function GameHud({
  nickname,
  title,
  titleEmoji,
  backHref,
  backLabel,
  progress,
  variant = "space",
}: GameHudProps) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <header
      className={cn(
        "game-hud sticky top-0 z-30 px-4 py-3",
        variant === "adventure" && "game-hud-adventure"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Link href="/" className="game-hud-logo">
            Logic Gym
          </Link>
          {backHref && (
            <Link href={backHref} className="game-hud-back hidden truncate sm:inline">
              ← {backLabel ?? "返回"}
            </Link>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {title && (
            <p className="truncate text-sm font-bold text-[var(--game-text)]">
              {titleEmoji && <span className="mr-1">{titleEmoji}</span>}
              {title}
            </p>
          )}
          {progress && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="game-progress-track h-1.5 flex-1">
                <div
                  className="game-progress-fill h-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-medium tabular-nums text-[var(--game-text-muted)]">
                {progress.current}/{progress.total}
              </span>
            </div>
          )}
        </div>

        {nickname && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-[var(--game-text-muted)] sm:inline">
              {nickname}
            </span>
            <form action={signOut}>
              <button type="submit" className="game-hud-ghost-btn text-[10px]">
                登出
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
