import { authDb } from "@gladia-app/db/auth-db";
import { gym, membership, subscription } from "@gladia-app/db/schema";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[stripe-webhook] Missing signature header");
    return new NextResponse("No signature", { status: 400 });
  }

  const rawBody = Buffer.from(await req.arrayBuffer());
  console.log("[stripe-webhook] Raw body length", rawBody.length);
  console.log("[stripe-webhook] Stripe signature header", sig);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("[stripe-webhook] Event received", {
    id: event.id,
    type: event.type,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    console.log("[stripe-webhook] Checkout session metadata", metadata);

    const userId = metadata.user_id;
    const gymName = metadata.gym_name;
    const slug = metadata.slug;
    const timezone = metadata.timezone;
    const planType = metadata.plan_type;

    const stripeCustomerId =
        typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    const stripeSubscriptionId =
        typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as any)?.id;

    if (!userId || !gymName || !slug || !timezone || !planType) {
        console.error("[stripe-webhook] Missing required metadata:", metadata);
        return new NextResponse("Missing metadata", { status: 200 });
    }
    
    if (!stripeCustomerId || !stripeSubscriptionId) {
        console.error("[stripe-webhook] Missing Stripe IDs:", {
            stripeCustomerId,
            stripeSubscriptionId,
        });
        return new NextResponse("Missing Stripe IDs", { status: 200 });
    }

    try {
        const existingSubscription = await authDb.query.subscription.findFirst({
            where: (subscription, { eq }) => eq(subscription.stripeCustomerId, stripeCustomerId),
        });

        if (existingSubscription) {
            console.log("[stripe-webhook] Subscription already exists, skipping", {
                stripeCustomerId,
                stripeSubscriptionId,
            });
            return new NextResponse("OK", { status: 200 });
        }

        const newGym = await authDb.insert(gym).values({
            name: gymName,
            slug: slug,
            country: timezone,
            status: "active",
            inviteToken: crypto.randomUUID(),
            inviteEnabled: true,
            inviteTokenUpdatedAt: new Date(),
        }).returning();

        console.log("[stripe-webhook] Created gym", newGym[0]);

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        console.log("[stripe-webhook] Retrieved Stripe subscription", {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
        });

        await authDb.insert(subscription).values({
            userId: userId,
            gymId: newGym[0]!.id,
            stripeCustomerId: stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId,
            planName: planType,
            status: "active",
            currentPeriodStart: new Date(stripeSubscription.items.data![0]!.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.items.data![0]!.current_period_end * 1000),
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,  
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await authDb.insert(membership).values({
            userId,
            gymId: newGym[0]!.id,
            role: "admin",
        });

        console.log("[stripe-webhook] Created subscription and membership", {
            gymId: newGym[0]!.id,
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
        });
    } catch (err) {
        console.error("[stripe-webhook] Error creating academy/membership:", err);
    }
  }

  return new NextResponse("OK", { status: 200 });
}
