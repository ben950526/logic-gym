import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import type { UserPlan } from "@/lib/constants";

export async function updateUserPlan(
  userId: string,
  plan: UserPlan,
  stripe?: {
    customerId?: string | null;
    subscriptionId?: string | null;
  }
) {
  const supabase = createSupabaseAdmin();
  const payload: Record<string, unknown> = { plan };

  if (stripe?.customerId) {
    payload.stripe_customer_id = stripe.customerId;
  }
  if (stripe?.subscriptionId !== undefined) {
    payload.stripe_subscription_id = stripe.subscriptionId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) {
    throw new Error(`更新會員方案失敗：${error.message}`);
  }
}

export async function findUserIdByStripeCustomerId(
  customerId: string
): Promise<string | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw new Error(`查詢 Stripe 會員失敗：${error.message}`);
  }

  return data?.id ?? null;
}
