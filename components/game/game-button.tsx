import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GameButtonVariant = "primary" | "gold" | "ghost";

interface GameButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: GameButtonVariant;
  fullWidth?: boolean;
}

interface GameButtonLinkProps extends GameButtonBaseProps {
  href: string;
}

interface GameButtonNativeProps extends GameButtonBaseProps {
  href?: never;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

type GameButtonProps = GameButtonLinkProps | GameButtonNativeProps;

const variantClass: Record<GameButtonVariant, string> = {
  primary: "game-btn-primary",
  gold: "game-btn-gold",
  ghost: "game-btn-ghost",
};

export function GameButton({
  children,
  className,
  variant = "primary",
  fullWidth,
  ...rest
}: GameButtonProps) {
  const cls = cn(
    "game-btn",
    variantClass[variant],
    fullWidth && "w-full",
    className
  );

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={cls}>
        {children}
      </Link>
    );
  }

  const native = rest as GameButtonNativeProps;
  return (
    <button
      type={native.type ?? "button"}
      className={cls}
      onClick={native.onClick}
      disabled={native.disabled}
    >
      {children}
    </button>
  );
}
