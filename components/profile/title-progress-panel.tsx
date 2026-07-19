"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setActiveTitle } from "@/app/practice/actions";
import type { CategoryTitleStatus } from "@/lib/title-status";
import { cn } from "@/lib/utils";

interface TitleProgressPanelProps {
  statuses: CategoryTitleStatus[];
}

export function TitleProgressPanel({ statuses }: TitleProgressPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const unlockedCount = statuses.filter((item) => item.unlocked).length;

  function handleSelect(category: string) {
    startTransition(async () => {
      const result = await setActiveTitle(category);
      if (!result?.error) {
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-900">類別封號</p>
        <p className="text-xs text-zinc-500">
          各類答對 20 題解鎖 · 已解鎖 {unlockedCount} / 3
        </p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {statuses.map((item) => (
          <div
            key={item.category}
            className={cn(
              "rounded-lg border p-3",
              item.isActive
                ? "border-amber-300 bg-amber-50"
                : "border-zinc-100 bg-zinc-50"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold",
                    item.unlocked ? "text-amber-900" : "text-zinc-400"
                  )}
                >
                  {item.unlocked ? item.title : "未解鎖"}
                </p>
              </div>
              {item.unlocked && (
                <button
                  type="button"
                  disabled={isPending || item.isActive}
                  onClick={() => handleSelect(item.category)}
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
                    item.isActive
                      ? "bg-amber-200 text-amber-900"
                      : "border border-amber-300 text-amber-800 hover:bg-amber-100"
                  )}
                >
                  {item.isActive ? "使用中" : "設為主封號"}
                </button>
              )}
            </div>
            {!item.unlocked && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>
                    {item.correctCount} / {item.required} 題
                  </span>
                  <span>還差 {item.remaining} 題</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
