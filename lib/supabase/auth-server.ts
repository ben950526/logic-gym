import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * 連線 Supabase Auth；網路/DNS 失敗時回 null，不讓整頁 crash。
 */
export async function getSafeAuthUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("[auth] getUser:", error.message);
      return null;
    }

    return data.user;
  } catch (err) {
    console.warn("[auth] getUser fetch failed:", err);
    return null;
  }
}

export async function isSupabaseReachable(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return false;

    const supabase = await createClient();
    const { error } = await supabase.auth.getUser();

    if (error?.message?.includes("fetch failed")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
