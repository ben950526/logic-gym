import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DialogueVariant = "default" | "mission" | "boss" | "clear" | "recap";

interface DialogueBoxProps {
  speaker: string;
  children: ReactNode;
  variant?: DialogueVariant;
  portrait?: string;
  portraitLabel?: string;
  className?: string;
}

const variantStyles: Record<DialogueVariant, string> = {
  default: "game-dialogue-default",
  mission: "game-dialogue-mission",
  boss: "game-dialogue-boss",
  clear: "game-dialogue-clear",
  recap: "game-dialogue-recap",
};

export function DialogueBox({
  speaker,
  children,
  variant = "default",
  portrait = "👨‍🚀",
  portraitLabel,
  className,
}: DialogueBoxProps) {
  return (
    <div className={cn("game-dialogue", variantStyles[variant], className)}>
      <div className="game-dialogue-portrait" aria-hidden>
        <span className="text-2xl">{portrait}</span>
        {portraitLabel && (
          <span className="game-dialogue-portrait-label">{portraitLabel}</span>
        )}
      </div>
      <div className="game-dialogue-body min-w-0 flex-1">
        <p className="game-dialogue-speaker">{speaker}</p>
        <div className="game-dialogue-text">{children}</div>
      </div>
    </div>
  );
}
