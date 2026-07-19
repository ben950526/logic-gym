import Link from "next/link";
import { redirect } from "next/navigation";
import { V2_GALAXY_MODE } from "@/lib/feature-flags";
import { LevelBar } from "@/components/profile/level-bar";
import { TitleProgressPanel } from "@/components/profile/title-progress-panel";
import { SiteHeader } from "@/components/layout/site-header";
import { PuzzlePlayer } from "@/components/practice/puzzle-player";
import {
  getCurrentUserProfile,
  getDailyPracticeStatus,
} from "@/lib/daily-limit";
import {
  buildCategoryTitleStatuses,
  getActiveTitleDisplay,
} from "@/lib/title-status";
import { pickPracticePuzzle } from "@/lib/supabase/practice-puzzles";
import { getSafeAuthUser } from "@/lib/supabase/auth-server";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import type { CategoryTitleStatus } from "@/lib/title-status";

export default async function PracticePage() {
  if (V2_GALAXY_MODE) {
    redirect("/galaxy");
  }

  if (!isSupabaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-zinc-600">請先設定 Supabase 環境變數才能練功。</p>
        </main>
      </>
    );
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    const user = await getSafeAuthUser();

    if (user) {
      return (
        <>
          <SiteHeader />
          <main className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h1 className="text-xl font-bold">無法載入個人資料</h1>
            <p className="mt-3 text-zinc-600">
              你已登入，但讀取 profile 失敗。請確認 Supabase 已執行 migration
              003、004。
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              回首頁
            </Link>
          </main>
        </>
      );
    }

    redirect("/login?next=/practice");
  }

  const { userId, profile } = session;
  const daily = await getDailyPracticeStatus(userId, profile.plan);
  const activeTitle = getActiveTitleDisplay(profile.active_title_category);

  let titleStatuses: CategoryTitleStatus[] = [];
  try {
    titleStatuses = await buildCategoryTitleStatuses(
      userId,
      profile.unlocked_title_categories,
      profile.active_title_category
    );
  } catch {
    titleStatuses = [];
  }

  if (daily.reachedLimit) {
    return (
      <>
        <SiteHeader
          nickname={profile.nickname}
          level={profile.level}
          title={activeTitle}
          showCompetitionLink={profile.plan === "paid"}
        />
        <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">今日練功完成</h1>
            <p className="mt-3 text-zinc-600">
              你已完成 {daily.used} / {daily.limit} 題，明天再來吧！
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              回首頁
            </Link>
          </div>
        </main>
      </>
    );
  }

  const puzzle = await pickPracticePuzzle(userId);

  if (!puzzle) {
    return (
      <>
        <SiteHeader
          nickname={profile.nickname}
          level={profile.level}
          title={activeTitle}
          showCompetitionLink={profile.plan === "paid"}
        />
        <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center">
            <p className="text-zinc-600">目前沒有可練習的題目。</p>
            <p className="mt-2 text-sm text-zinc-500">
              請確認後台已有「已上架」的題目。
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        nickname={profile.nickname}
        level={profile.level}
        title={activeTitle}
        showCompetitionLink={profile.plan === "paid"}
      />
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <LevelBar level={profile.level} exp={profile.exp} />
        {titleStatuses.length > 0 && (
          <TitleProgressPanel statuses={titleStatuses} />
        )}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">練功區</p>
            <h1 className="text-2xl font-bold">今日第 {daily.used + 1} 題</h1>
          </div>
          <p className="text-sm text-zinc-500">
            剩餘 {daily.remaining} / {daily.limit} 題
            {profile.plan === "free" && (
              <>
                {" "}
                ·{" "}
                <Link href="/pricing" className="text-amber-700 hover:underline">
                  升級 20 題/天（NT$99/月）
                </Link>
              </>
            )}
            {profile.plan === "paid" && (
              <span className="ml-1 text-amber-700">（付費會員）</span>
            )}
          </p>
        </div>
        <PuzzlePlayer
          key={puzzle.id}
          puzzle={puzzle}
          dailyUsed={daily.used}
          dailyLimit={daily.limit}
        />
      </main>
    </>
  );
}
