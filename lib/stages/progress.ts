import { createClient } from "@/lib/supabase/server";

export async function getClearedStageIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stage_progress")
    .select("stage_id")
    .eq("user_id", userId);

  if (error) {
    if (error.message.includes("stage_progress") || error.code === "42P01") {
      return new Set();
    }
    throw new Error(`讀取關卡進度失敗：${error.message}`);
  }

  return new Set((data ?? []).map((row) => row.stage_id as string));
}

export async function markStageCleared(
  userId: string,
  stageId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("stage_progress").upsert(
    {
      user_id: userId,
      stage_id: stageId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,stage_id" }
  );

  if (error) {
    if (error.message.includes("stage_progress") || error.code === "42P01") {
      return {
        error:
          "尚未建立關卡進度表。請到 Supabase SQL Editor 執行 migrations/008_stage_progress_ascii.sql",
      };
    }
    return { error: `儲存過關紀錄失敗：${error.message}` };
  }

  return {};
}

export async function isStageProgressTableReady(): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("stage_progress").select("stage_id").limit(1);
  if (!error) return true;
  return !(error.message.includes("stage_progress") || error.code === "42P01");
}
