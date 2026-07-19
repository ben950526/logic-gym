import type { StoryAct } from "@/lib/story/season-1";
import { ShellArtPanel } from "@/components/game/shell-art-panel";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface ChapterBannerProps {
  act: StoryAct;
  beat?: string;
  theme?: "light" | "game" | "adventure";
  className?: string;
}

export function ChapterBanner({
  act,
  beat,
  theme = "light",
  className,
}: ChapterBannerProps) {
  const isGame = theme === "game";
  const isAdventure = theme === "adventure";

  if (isAdventure) {
    return (
      <ShellArtPanel
        src={SHELL_ASSETS.chapterBanner}
        layout={SHELL_ART_LAYOUT.chapterBanner}
        className={cn("chapter-banner-adventure chapter-banner-adventure--art", className)}
        contentClassName="chapter-banner-adventure__content"
      >
        <p className="chapter-label">
          {act.chapter} · {act.title}
        </p>
        {beat && <p className="chapter-beat">{beat}</p>}
      </ShellArtPanel>
    );
  }

  return (
    <div
      className={cn(
        isGame
          ? "chapter-banner-game px-4 py-3"
          : "rounded-xl border border-indigo-200/60 bg-indigo-50/80 px-4 py-3",
        className
      )}
    >
      <p
        className={cn(
          "chapter-label text-xs font-bold uppercase tracking-wider",
          !isGame && "text-indigo-500"
        )}
      >
        {act.chapter} · {act.title}
      </p>
      {beat && (
        <p
          className={cn(
            "chapter-beat mt-0.5 text-sm font-semibold",
            !isGame && "text-indigo-900"
          )}
        >
          {beat}
        </p>
      )}
    </div>
  );
}
