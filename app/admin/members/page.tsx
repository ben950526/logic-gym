import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { MemberAdminTable } from "@/components/admin/member-admin-table";
import { loginAdminToMembers } from "@/app/admin/puzzles/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listMembersForAdmin } from "@/lib/admin-members";
import { isSupabaseConfigured } from "@/lib/puzzles-local";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">會員管理後台</h1>
          <p className="text-sm text-zinc-600">請先輸入 Admin 密鑰</p>
        </div>
        <form
          action={loginAdminToMembers}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
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
            進入會員後台
          </button>
          {params.error === "auth" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              密鑰錯誤
            </p>
          )}
        </form>
        <p className="text-center text-sm text-zinc-500">
          <Link href="/admin/puzzles" className="text-blue-600 hover:underline">
            前往題庫後台
          </Link>
        </p>
      </main>
    );
  }

  const query = params.q ?? "";

  let members: Awaited<ReturnType<typeof listMembersForAdmin>> = [];
  let loadError: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      members = await listMembersForAdmin(query);
    } catch (error) {
      loadError =
        error instanceof Error ? error.message : "讀取 Supabase 失敗";
    }
  } else {
    loadError = "尚未設定 Supabase";
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <AdminNav active="members" />

      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">會員方案</h1>
        <p className="text-sm text-zinc-600">
          人工收款後，在此將會員設為「付費」開通 20 題/天與積分賽。
        </p>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <MemberAdminTable initialMembers={members} initialQuery={query} />

      <p className="mt-6 text-center text-xs text-zinc-500">
        <Link href="/pricing" className="hover:text-zinc-800">
          查看使用者方案頁
        </Link>
      </p>
    </main>
  );
}
