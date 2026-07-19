import { dailyLimitForPlan } from "@/lib/constants";
import { getSafeAuthUser } from "@/lib/supabase/auth-server";
import { createClient } from "@/lib/supabase/server";
import type { UserPlan } from "@/lib/constants";
import type { UserProfile } from "@/types/user";

const PROFILE_SELECT_FULL =
  "id, nickname, plan, level, exp, unlocked_title_categories, active_title_category, stripe_customer_id, stripe_subscription_id, created_at";
const PROFILE_SELECT_BASE = "id, nickname, plan, level, exp, created_at";
const PROFILE_SELECT_LEGACY = "id, nickname, plan, created_at";

function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  return {
    id: raw.id as string,
    nickname: raw.nickname as string,
    plan: raw.plan as UserPlan,
    level: (raw.level as number | undefined) ?? 1,
    exp: (raw.exp as number | undefined) ?? 0,
    unlocked_title_categories:
      (raw.unlocked_title_categories as string[] | undefined) ?? [],
    active_title_category:
      (raw.active_title_category as UserProfile["active_title_category"]) ?? null,
    stripe_customer_id: (raw.stripe_customer_id as string | null | undefined) ?? null,
    stripe_subscription_id:
      (raw.stripe_subscription_id as string | null | undefined) ?? null,
    created_at: raw.created_at as string,
  };
}

async function loadProfileRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  for (const select of [
    PROFILE_SELECT_FULL,
    PROFILE_SELECT_BASE,
    PROFILE_SELECT_LEGACY,
  ]) {
    const { data, error } = await supabase
      .from("profiles")
      .select(select)
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data as unknown as Record<string, unknown>;
    }
  }

  return null;
}

async function createProfileRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nickname: string
) {
  const attempts: Record<string, unknown>[] = [
    {
      id: userId,
      nickname,
      plan: "free",
      level: 1,
      exp: 0,
      unlocked_title_categories: [],
      active_title_category: null,
    },
    {
      id: userId,
      nickname,
      plan: "free",
      level: 1,
      exp: 0,
    },
    {
      id: userId,
      nickname,
      plan: "free",
    },
  ];

  for (const payload of attempts) {
    const { error } = await supabase.from("profiles").upsert(payload);

    if (!error) {
      return await loadProfileRow(supabase, userId);
    }
  }

  return null;
}

function startOfTodayUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
}

export async function getCurrentUserProfile(): Promise<{
  userId: string;
  profile: UserProfile;
} | null> {
  const user = await getSafeAuthUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  let profileRow = await loadProfileRow(supabase, user.id);

  if (!profileRow) {
    const fallbackNickname =
      user.user_metadata?.nickname?.trim() || user.email?.split("@")[0] || "學員";
    profileRow = await createProfileRow(
      supabase,
      user.id,
      fallbackNickname.slice(0, 20)
    );
  }

  if (!profileRow) {
    return null;
  }

  const profile = normalizeProfile(profileRow);

  return {
    userId: user.id,
    profile,
  };
}

export async function getDailyAttemptCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("puzzle_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfTodayUtc());

  if (error) {
    throw new Error(`讀取今日題數失敗：${error.message}`);
  }

  return count ?? 0;
}

export async function getDailyPracticeStatus(userId: string, plan: UserPlan) {
  const used = await getDailyAttemptCount(userId);
  const limit = dailyLimitForPlan(plan);

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    reachedLimit: used >= limit,
  };
}
