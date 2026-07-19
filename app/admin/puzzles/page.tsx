import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPuzzlesForAdmin } from "@/lib/supabase/practice-puzzles";
import {
  isSupabaseConfigured,
  loadLocalSamplePuzzles,
  toPuzzleRecords,
} from "@/lib/puzzles-local";
import type { PuzzleRecord } from "@/types/puzzle";
import { loginAdmin, setPuzzleStatus, setPuzzleCompetitionPool } from "./actions";
import { PuzzleAdminTable } from "@/components/admin/puzzle-admin-table";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminPuzzlesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAdminAuthenticated();
  const supabaseReady = isSupabaseConfigured();

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">題庫管理後台</h1>
          <p className="text-sm text-zinc-600">Step 1 · 請輸入 Admin 密鑰</p>
        </div>
        <form action={loginAdmin} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Admin Secret</span>
            <input
              type="password"
              name="secret"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="與 .env.local 的 ADMIN_SECRET 相同"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            進入後台
          </button>
          {params.error === "auth" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              密鑰錯誤
            </p>
          )}
        </form>
        <p className="text-center text-xs text-zinc-500">
          尚未設定？複製 <code className="rounded bg-zinc-100 px-1">.env.example</code> 為{" "}
          <code className="rounded bg-zinc-100 px-1">.env.local</code>
        </p>
      </main>
    );
  }

  let puzzles: PuzzleRecord[] = [];
  let dataSource: "supabase" | "local" = "local";
  let loadError: string | null = null;

  if (supabaseReady) {
    try {
      puzzles = await listPuzzlesForAdmin();
      dataSource = "supabase";
    } catch (error) {
      loadError =
        error instanceof Error ? error.message : "讀取 Supabase 失敗";
      const samples = await loadLocalSamplePuzzles();
      puzzles = toPuzzleRecords(samples);
      dataSource = "local";
    }
  } else {
    const samples = await loadLocalSamplePuzzles();
    puzzles = toPuzzleRecords(samples);
    dataSource = "local";
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <AdminNav active="puzzles" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">題庫管理</h1>
        <p className="mt-1 text-sm text-zinc-600">審核、上下架題目</p>
      </div>

      <div className="mb-6 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <p>
          <span className="font-medium">資料來源：</span>
          {dataSource === "supabase" ? "Supabase" : "本地 samples.json（預覽模式）"}
        </p>
        {!supabaseReady && (
          <p className="text-amber-700">
            尚未設定 Supabase 環境變數。請設定後執行 migration 與{" "}
            <code className="rounded bg-zinc-100 px-1">npm run seed:puzzles</code>。
          </p>
        )}
        {loadError && (
          <p className="text-red-600">
            Supabase 讀取失敗，已 fallback 本地樣本：{loadError}
          </p>
        )}
        <p className="text-zinc-500">
          共 {puzzles.length} 題 · 批次出題請執行{" "}
          <code className="rounded bg-zinc-100 px-1">npm run generate:puzzles</code>
        </p>
      </div>

      <PuzzleAdminTable
        puzzles={puzzles}
        onSetStatus={setPuzzleStatus}
        onSetCompetitionPool={setPuzzleCompetitionPool}
      />
    </main>
  );
}
