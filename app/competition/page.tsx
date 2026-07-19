import Link from "next/link";
import { redirect } from "next/navigation";
import { V2_GALAXY_MODE } from "@/lib/feature-flags";
import { SiteHeader } from "@/components/layout/site-header";
import { CompetitionLeaderboard } from "@/components/competition/competition-leaderboard";
import { PuzzlePlayer } from "@/components/practice/puzzle-player";
import { getWeekLabel } from "@/lib/competition";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { getActiveTitleDisplay } from "@/lib/title-status";
import {
  getCompetitionDailyStatus,
  getUserWeekPoints,
  getWeeklyLeaderboard,
  pickCompetitionPuzzle,
} from "@/lib/supabase/competition";
import { isSupabaseConfigured } from "@/lib/puzzles-local";

export default async function CompetitionPage() {
  if (V2_GALAXY_MODE) {
    redirect("/galaxy");
  }

  if (!isSupabaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-zinc-600">請先設定 Supabase。</p>
        </main>
      </>
    );
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/competition");
  }

  const { userId, profile } = session;
  const activeTitle = getActiveTitleDisplay(profile.active_title_category);

  if (profile.plan !== "paid") {
    return (
      <>
        <SiteHeader
          nickname={profile.nickname}
          level={profile.level}
          title={activeTitle}
        />
        <main className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">積分賽</h1>
          <p className="text-zinc-600">
            積分賽僅開放付費會員。升級後可參加本週排行，與練功 EXP 分開計算。
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            升級 NT$99/月
          </Link>
          <p>
            <Link href="/practice" className="text-sm text-zinc-500 hover:text-zinc-800">
              返回練功
            </Link>
          </p>
        </main>
      </>
    );
  }

  const daily = await getCompetitionDailyStatus(userId);
  const weekPoints = await getUserWeekPoints(userId, daily.weekKey);
  let leaderboard = null;

  try {
    leaderboard = await getWeeklyLeaderboard(userId, daily.weekKey);
  } catch {
    leaderboard = null;
  }

  if (daily.reachedLimit) {
    return (
      <>
        <SiteHeader
          nickname={profile.nickname}
          level={profile.level}
          title={activeTitle}
          showCompetitionLink
        />
        <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
          <CompetitionHeader
            weekKey={daily.weekKey}
            weekPoints={weekPoints}
            dailyUsed={daily.used}
            dailyLimit={daily.limit}
          />
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">今日積分賽完成</h2>
            <p className="mt-3 text-zinc-600">
              你已完成 {daily.used} / {daily.limit} 題，明天再來衝榜！
            </p>
          </div>
          {leaderboard && <CompetitionLeaderboard data={leaderboard} />}
        </main>
      </>
    );
  }

  const puzzle = await pickCompetitionPuzzle(userId);

  return (
    <>
      <SiteHeader
        nickname={profile.nickname}
        level={profile.level}
        title={activeTitle}
        showCompetitionLink
      />
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <CompetitionHeader
          weekKey={daily.weekKey}
          weekPoints={weekPoints}
          dailyUsed={daily.used}
          dailyLimit={daily.limit}
        />

        {!puzzle ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center">
            <p className="text-zinc-600">目前沒有積分賽題目。</p>
            <p className="mt-2 text-sm text-zinc-500">
              請到後台將題目加入「積分賽題庫」。
            </p>
          </div>
        ) : (
          <PuzzlePlayer
            key={puzzle.id}
            puzzle={puzzle}
            dailyUsed={daily.used}
            dailyLimit={daily.limit}
            mode="competition"
          />
        )}

        {leaderboard && <CompetitionLeaderboard data={leaderboard} />}
      </main>
    </>
  );
}

function CompetitionHeader({
  weekKey,
  weekPoints,
  dailyUsed,
  dailyLimit,
}: {
  weekKey: string;
  weekPoints: number;
  dailyUsed: number;
  dailyLimit: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-violet-600">積分賽 · 本週試跑</p>
        <h1 className="text-2xl font-bold">{getWeekLabel(weekKey)}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          本週積分 <span className="font-semibold text-violet-700">{weekPoints}</span>
          {" · "}
          今日第 {dailyUsed + 1} 題 · 剩餘 {dailyLimit - dailyUsed} 題
        </p>
      </div>
      <Link
        href="/practice"
        className="text-sm text-zinc-500 hover:text-zinc-800"
      >
        練功區
      </Link>
    </div>
  );
}
