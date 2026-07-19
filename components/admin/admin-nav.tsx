import Link from "next/link";
import { logoutAdmin } from "@/app/admin/puzzles/actions";

interface AdminNavProps {
  active: "puzzles" | "members";
}

export function AdminNav({ active }: AdminNavProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← 回首頁
        </Link>
        <div className="mt-3 flex gap-2">
          <Link
            href="/admin/puzzles"
            className={
              active === "puzzles"
                ? "rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
            }
          >
            題庫
          </Link>
          <Link
            href="/admin/members"
            className={
              active === "members"
                ? "rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
            }
          >
            會員
          </Link>
        </div>
      </div>
      <form action={logoutAdmin}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          登出
        </button>
      </form>
    </div>
  );
}
