import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GamePanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  glow?: boolean;
}

export function GamePanel({ children, className, title, glow }: GamePanelProps) {
  return (
    <div className={cn("game-panel", glow && "game-panel-glow", className)}>
      {title && <p className="game-panel-title">{title}</p>}
      {children}
    </div>
  );
}
