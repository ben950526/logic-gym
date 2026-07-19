import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  findUserIdByStripeCustomerId,
  updateUserPlan,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function resolveUserId(
  metadata: Stripe.Metadata | null | undefined,
  customerId?: string | null
) {
  const fromMetadata = metadata?.supabase_user_id;
  if (fromMetadata) {
    return fromMetadata;
  }

  if (customerId) {
    return findUserIdByStripeCustomerId(customerId);
  }

  return null;
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  plan: "free" | "paid"
) {
  const userId = await resolveUserId(
    subscription.metadata,
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id
  );

  if (!userId) {
    console.error("Stripe webhook: user not found for subscription", subscription.id);
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await updateUserPlan(userId, plan, {
    customerId,
    subscriptionId: plan === "paid" ? subscription.id : null,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = await resolveUserId(
          session.metadata,
          session.customer as string | null
        );
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && subscriptionId) {
          await updateUserPlan(userId, "paid", {
            customerId: session.customer as string | undefined,
            subscriptionId,
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const active =
          subscription.status === "active" ||
          subscription.status === "trialing";
        await syncSubscription(subscription, active ? "paid" : "free");
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription, "free");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
