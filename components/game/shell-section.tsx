import type { ReactNode } from "react";
import { ShellArtPanel } from "@/components/game/shell-art-panel";
import { SHELL_ART_LAYOUT, SHELL_ASSETS } from "@/lib/world/shell-assets";
import { cn } from "@/lib/utils";

export type ShellSectionKind = "dialogue" | "mission" | "chapter" | "expedition";

const SHELL_SECTION_CONFIG = {
  dialogue: {
    src: SHELL_ASSETS.panelDialogue,
    layout: SHELL_ART_LAYOUT.panelDialogue,
    shellClass: "shell-section shell-section--dialogue",
    contentClass: "shell-section__content shell-section__content--dialogue",
  },
  mission: {
    src: SHELL_ASSETS.panelMission,
    layout: SHELL_ART_LAYOUT.panelMission,
    shellClass: "shell-section shell-section--mission",
    contentClass: "shell-section__content shell-section__content--mission",
  },
  chapter: {
    src: SHELL_ASSETS.chapterBanner,
    layout: SHELL_ART_LAYOUT.chapterBanner,
    shellClass: "shell-section shell-section--chapter",
    contentClass: "shell-section__content shell-section__content--chapter",
  },
  expedition: {
    src: SHELL_ASSETS.panelExpedition,
    layout: SHELL_ART_LAYOUT.panelExpedition,
    shellClass: "shell-section shell-section--expedition",
    contentClass: "shell-section__content shell-section__content--expedition",
  },
} as const;

interface ShellSectionProps {
  kind: ShellSectionKind;
  className?: string;
  contentClassName?: string;
  grow?: boolean;
  children: ReactNode;
}

/** 重用既有 MJ 框圖，統一首頁／訂閱等區塊視覺 */
export function ShellSection({
  kind,
  className,
  contentClassName,
  grow = false,
  children,
}: ShellSectionProps) {
  const cfg = SHELL_SECTION_CONFIG[kind];
  return (
    <ShellArtPanel
      src={cfg.src}
      layout={cfg.layout}
      grow={grow}
      className={cn(cfg.shellClass, className)}
      contentClassName={cn(cfg.contentClass, contentClassName)}
    >
      {children}
    </ShellArtPanel>
  );
}
