import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import type { UserPlan } from "@/lib/constants";

export interface AdminMemberRow {
  id: string;
  nickname: string;
  plan: UserPlan;
  created_at: string;
}

export async function listMembersForAdmin(
  query?: string
): Promise<AdminMemberRow[]> {
  const supabase = createSupabaseAdmin();
  let request = supabase
    .from("profiles")
    .select("id, nickname, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const trimmed = query?.trim();
  if (trimmed) {
    request = request.ilike("nickname", `%${trimmed}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`讀取會員失敗：${error.message}`);
  }

  return (data ?? []) as AdminMemberRow[];
}

export async function setMemberPlan(userId: string, plan: UserPlan) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("id", userId);

  if (error) {
    throw new Error(`更新方案失敗：${error.message}`);
  }
}
