import { authDb } from "@gladia-app/db/auth-db";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { gym, membership, payment, subscription } from "@gladia-app/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("No signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};

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
        console.error("Missing required metadata:", metadata);
        return new NextResponse("Missing metadata", { status: 200 });
    }
    
    if (!stripeCustomerId || !stripeSubscriptionId) {
        console.error("Missing Stripe IDs:", {
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

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

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
    } catch (err) {
        console.error("Error creating academy/membership:", err);
    }
  }

  return new NextResponse("OK", { status: 200 });
}
