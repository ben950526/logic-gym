import type { ReactNode } from "react";
import { ShellArtPanel } from "@/components/game/shell-art-panel";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface StoryBubbleProps {
  speaker: string;
  children: ReactNode;
  variant?: "intro" | "clear" | "boss" | "default";
  theme?: "light" | "game" | "adventure";
  className?: string;
}

const variantStyles = {
  intro: "border-blue-200 bg-blue-50/90 text-blue-950",
  clear: "border-amber-200 bg-amber-50/90 text-amber-950",
  boss: "border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 text-orange-950",
  default: "border-zinc-200 bg-white text-zinc-800",
};

const gameVariantStyles = {
  intro: "story-bubble-game story-bubble-game-intro",
  clear: "story-bubble-game story-bubble-game-clear",
  boss: "story-bubble-game story-bubble-game-boss",
  default: "story-bubble-game",
};

const adventureVariantStyles = {
  intro: "story-bubble-adventure--intro",
  clear: "story-bubble-adventure--clear",
  boss: "story-bubble-adventure--boss",
  default: "story-bubble-adventure--recap",
};

export function StoryBubble({
  speaker,
  children,
  variant = "default",
  theme = "light",
  className,
}: StoryBubbleProps) {
  const isGame = theme === "game";
  const isAdventure = theme === "adventure";

  if (isAdventure) {
    return (
      <ShellArtPanel
        src={SHELL_ASSETS.panelDialogue}
        layout={SHELL_ART_LAYOUT.panelDialogue}
        className={cn(
          "story-bubble-adventure story-bubble-adventure--art",
          adventureVariantStyles[variant],
          className
        )}
        contentClassName="story-bubble-adventure__content"
      >
        <p className="story-bubble-speaker">{speaker}</p>
        <div className="story-bubble-text">{children}</div>
      </ShellArtPanel>
    );
  }

  return (
    <div
      className={cn(
        "relative text-sm leading-relaxed",
        isGame
          ? cn("rounded-2xl border px-4 py-3 shadow-sm", gameVariantStyles[variant])
          : cn("rounded-2xl border px-4 py-3 shadow-sm", variantStyles[variant]),
        className
      )}
    >
      <p
        className={cn(
          "story-bubble-speaker mb-1 text-xs font-bold uppercase tracking-wide opacity-70"
        )}
      >
        {speaker}
      </p>
      <div>{children}</div>
      {!isGame && (
        <span
          className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 border-b border-r border-inherit bg-inherit"
          aria-hidden
        />
      )}
    </div>
  );
}
