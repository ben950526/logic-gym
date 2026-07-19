import { createClient } from "@supabase/supabase-js";
import type { PuzzleRecord, PuzzleStatus } from "@/types/puzzle";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listPuzzles(): Promise<PuzzleRecord[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`讀取題目失敗：${error.message}`);
  }

  return (data ?? []) as PuzzleRecord[];
}

export async function updatePuzzleStatus(
  id: string,
  status: PuzzleStatus
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("puzzles")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`更新狀態失敗：${error.message}`);
  }
}

export async function updatePuzzleCompetitionPool(
  id: string,
  inCompetitionPool: boolean
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("puzzles")
    .update({ in_competition_pool: inCompetitionPool })
    .eq("id", id);

  if (error) {
    throw new Error(`更新積分賽題庫失敗：${error.message}`);
  }
}
