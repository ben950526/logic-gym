"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateMemberPlan } from "@/app/admin/members/actions";
import type { AdminMemberRow } from "@/lib/admin-members";

interface MemberAdminTableProps {
  initialMembers: AdminMemberRow[];
  initialQuery: string;
}

export function MemberAdminTable({
  initialMembers,
  initialQuery,
}: MemberAdminTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    router.push(`/admin/members?${params.toString()}`);
  }

  function handlePlanChange(userId: string, plan: "free" | "paid") {
    setMessage(null);
    startTransition(async () => {
      const result = await updateMemberPlan(userId, plan);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("已更新方案");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋暱稱"
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          搜尋
        </button>
      </form>

      {message && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">暱稱</th>
              <th className="px-4 py-3 font-medium">方案</th>
              <th className="px-4 py-3 font-medium">註冊</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {initialMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  找不到會員
                </td>
              </tr>
            ) : (
              initialMembers.map((member) => (
                <tr key={member.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium">{member.nickname}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        member.plan === "paid"
                          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                          : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                      }
                    >
                      {member.plan === "paid" ? "付費" : "免費"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(member.created_at).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {member.plan !== "paid" && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handlePlanChange(member.id, "paid")}
                          className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60"
                        >
                          設為付費
                        </button>
                      )}
                      {member.plan !== "free" && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handlePlanChange(member.id, "free")}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60"
                        >
                          改回免費
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
