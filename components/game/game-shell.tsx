import Image from "next/image";
import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GameShellProps {
  children: ReactNode;
  className?: string;
  /** 星球主題色，用於光暈 */
  accent?: string;
  /** space = 星系；adventure = 星球關卡地圖（溫暖遠征風） */
  variant?: "space" | "adventure";
  /** MJ 全屏背景（如邏輯星系） */
  backgroundSrc?: string;
}

export function GameShell({
  children,
  className,
  accent,
  variant = "space",
  backgroundSrc,
}: GameShellProps) {
  const useArtBg = variant === "space" && Boolean(backgroundSrc);

  return (
    <div
      className={cn(
        "min-h-screen",
        variant === "adventure" ? "game-shell-adventure" : "game-shell",
        useArtBg && "game-shell--art"
      )}
    >
      {useArtBg && backgroundSrc && (
        <div className="game-shell-bg" aria-hidden>
          <Image
            src={backgroundSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="game-shell-bg-img"
          />
          <div className="game-shell-bg-scrim" />
        </div>
      )}

      {!useArtBg && (
        <div
          className="game-shell-glow pointer-events-none fixed inset-0"
          style={
            accent
              ? ({
                  background:
                    variant === "adventure"
                      ? `radial-gradient(ellipse 90% 45% at 50% 0%, ${accent}28, transparent 65%)`
                      : `radial-gradient(ellipse 80% 50% at 50% -10%, ${accent}22, transparent 70%)`,
                } as CSSProperties)
              : undefined
          }
          aria-hidden
        />
      )}

      <div
        className={cn(
          "game-shell-frame relative mx-auto min-h-screen",
          variant === "adventure" && "game-shell-frame-adventure",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
