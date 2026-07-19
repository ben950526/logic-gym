"use server";

import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/daily-limit";
import { createSupabaseAdmin } from "@/lib/supabase/puzzles";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function startCheckout() {
  if (!isStripeConfigured()) {
    return { error: "Stripe 尚未設定，請稍後再試。" };
  }

  const session = await getCurrentUserProfile();
  if (!session) {
    redirect("/login?next=/pricing");
  }

  const { userId, profile } = session;

  if (profile.plan === "paid") {
    return { error: "你已是付費會員。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "找不到登入 Email，無法建立付款。" };
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID!;
  const admin = createSupabaseAdmin();

  let customerId = profile.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;

    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", userId);
  }

  const origin = getAppOrigin();
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pricing?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    client_reference_id: userId,
    metadata: { supabase_user_id: userId },
    subscription_data: {
      metadata: { supabase_user_id: userId },
    },
  });

  if (!checkoutSession.url) {
    return { error: "無法建立付款頁面。" };
  }

  redirect(checkoutSession.url);
}
