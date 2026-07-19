interface TitleBadgeProps {
  title: string;
  size?: "sm" | "md";
}

export function TitleBadge({ title, size = "sm" }: TitleBadgeProps) {
  return (
    <span
      className={
        size === "sm"
          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
          : "rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900"
      }
    >
      {title}
    </span>
  );
}
