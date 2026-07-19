import { ShellArtPanel } from "@/components/game/shell-art-panel";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

interface MissionPromptProps {
  text: string;
  theme?: "light" | "game" | "adventure";
  className?: string;
}

export function MissionPrompt({
  text,
  theme = "light",
  className,
}: MissionPromptProps) {
  const isGame = theme === "game";
  const isAdventure = theme === "adventure";

  if (isAdventure) {
    return (
      <ShellArtPanel
        src={SHELL_ASSETS.panelMission}
        layout={SHELL_ART_LAYOUT.panelMission}
        className={cn("mission-prompt-adventure", className)}
        contentClassName="mission-prompt-adventure__content"
      >
        <span className="mission-icon shrink-0" aria-hidden>
          📜
        </span>
        <div className="min-w-0 flex-1">
          <p className="mission-label">本關任務</p>
          <p className="mission-text">{text}</p>
        </div>
      </ShellArtPanel>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isGame
          ? "mission-prompt-game px-4 py-3"
          : "rounded-xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 shadow-sm",
        className
      )}
      role="note"
    >
      <span className="mission-icon shrink-0" aria-hidden>
        📜
      </span>
      <div>
        <p
          className={cn(
            "mission-label text-xs font-bold uppercase tracking-wide",
            !isGame && "text-amber-700"
          )}
        >
          本關任務
        </p>
        <p
          className={cn(
            "mission-text mt-0.5 text-sm font-semibold leading-relaxed",
            !isGame && "text-amber-950"
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
