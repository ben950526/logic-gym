import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShellLayout = {
  aspectRatio: string;
  inset: string;
  /** 寬扁 MJ 圖：容器可高於比例最小值，避免裁字 */
  fluidMinHeight?: string;
};

interface ShellArtPanelProps {
  src: string;
  layout: ShellLayout;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * MJ shell 統一容器：inset 由 npm run analyze:shell-insets 量測，換圖後重跑即可。
 */
export function ShellArtPanel({
  src,
  layout,
  className,
  contentClassName,
  style,
  children,
}: ShellArtPanelProps) {
  const panelStyle = {
    aspectRatio: layout.aspectRatio,
    ["--shell-inset" as string]: layout.inset,
    ...(layout.fluidMinHeight
      ? { ["--shell-min-height" as string]: layout.fluidMinHeight }
      : {}),
    ...style,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "shell-art-panel",
        layout.fluidMinHeight && "shell-art-panel--fluid",
        className
      )}
      style={panelStyle}
    >
      <img src={src} alt="" className="shell-art-panel__bg" draggable={false} />
      <div className={cn("shell-art-panel__content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
