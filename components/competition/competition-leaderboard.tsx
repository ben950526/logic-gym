import type { LeaderboardEntry } from "@/lib/supabase/competition";
import { getWeekLabel } from "@/lib/competition";
import { cn } from "@/lib/utils";

interface CompetitionLeaderboardProps {
  data: {
    weekKey: string;
    entries: LeaderboardEntry[];
    myRank: number | null;
    myPoints: number;
  };
}

export function CompetitionLeaderboard({ data }: CompetitionLeaderboardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">本週排行榜</h2>
        <span className="text-xs text-zinc-500">{getWeekLabel(data.weekKey)}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        你的排名：
        {data.myRank != null ? (
          <span className="font-medium text-violet-700">
            {" "}
            第 {data.myRank} 名 · {data.myPoints} 分
          </span>
        ) : (
          <span> 尚未上榜（答對一題即可）</span>
        )}
      </p>

      {data.entries.length === 0 ? (
        <p className="mt-4 text-center text-sm text-zinc-500">本週尚無積分</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {data.entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.nickname}`}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                entry.isCurrentUser
                  ? "bg-violet-50 font-medium text-violet-900"
                  : "bg-zinc-50"
              )}
            >
              <span>
                <span className="mr-2 text-zinc-500">#{entry.rank}</span>
                {entry.nickname}
                {entry.isCurrentUser && (
                  <span className="ml-1 text-xs text-violet-600">（你）</span>
                )}
              </span>
              <span>{entry.points} 分</span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-xs text-zinc-400">
        限時作答 · 簡單 60 秒 / 中等 90 秒 / 困難 120 秒 · 答對 100～150 分 ·
        逾時或答錯 0 分 · 每週重置
      </p>
    </div>
  );
}
