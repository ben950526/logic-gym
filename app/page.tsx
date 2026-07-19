import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { MATH_PLANET_NAME, PATTERN_PLANET_NAME } from "@/lib/world/planet-names";
import { isSupabaseConfigured } from "@/lib/puzzles-local";
import { isSupabaseReachable } from "@/lib/supabase/auth-server";

export default async function HomePage() {
  const supabaseReady = isSupabaseConfigured();
  const supabaseOnline = supabaseReady ? await isSupabaseReachable() : false;
  const session = supabaseOnline ? await getCurrentUserProfile() : null;

  if (session) {
    redirect("/galaxy");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        {supabaseReady && !supabaseOnline ? (
          <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
            <p className="font-medium">無法連線 Supabase</p>
            <p className="mt-1 text-amber-900/90">
              請檢查網路，或到 Supabase 後台確認專案網址與 anon key 是否正確（
              <code className="text-xs">.env.local</code>）。
            </p>
            <p className="mt-2 text-amber-900/80">
              後台審題仍可用：
              <Link href="/admin/puzzles" className="ml-1 underline">
                /admin/puzzles
              </Link>
            </p>
          </div>
        ) : null}
        <div className="space-y-4">
          <p className="text-sm font-medium text-violet-600">Logic Gym · 各科星球</p>
          <h1 className="text-4xl font-bold tracking-tight">邏輯星系大冒險</h1>
          <p className="text-lg text-zinc-600">
            選一顆星球，一關一關前進。數學、找規律，答對就解鎖下一關！
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/login?next=/galaxy"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            登入 / 註冊
          </Link>
          <Link
            href="/login?next=/galaxy&mode=signup"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50"
          >
            免費開始
          </Link>
        </div>
        <p className="max-w-md text-sm text-zinc-500">
          國小數學 + 找規律 · 線性破關 · 通關{MATH_PLANET_NAME}後解鎖{PATTERN_PLANET_NAME}
        </p>
      </main>
    </>
  );
}
