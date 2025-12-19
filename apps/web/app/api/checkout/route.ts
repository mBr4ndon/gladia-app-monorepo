import { NextResponse } from "next/server";
import Stripe from "stripe";
import { setupGymSchema, type SetupGymData } from "@gladia-app/validation";
import { auth } from "@gladia-app/auth/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const formData = setupGymSchema.parse(body) as SetupGymData;

        const userSession = await auth.api.getSession({
            headers: req.headers,
        });

        if (!userSession?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { user } = userSession!;

        const { origin } = new URL(req.url);
        let customerId;
        const isAnnual = formData.planType === "annual";
        const unitAmount = isAnnual ? 58800 : 5900;
        const intervalValue = isAnnual ? "year" : "month";
        const planName = `${formData.name} - BJJ Academy Management ${isAnnual ? "Annual" : "Monthly"} Subscription`;

        const session = await stripe.checkout.sessions.create({
            customer: customerId || undefined,
            customer_email: user.email,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                    currency: "eur",
                    product_data: {
                        name: planName,
                        description: `Complete academy management platform with student tracking, class scheduling, and more.`
                    },
                    unit_amount: unitAmount,
                    recurring: {
                        interval: intervalValue
                    }
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            subscription_data: {
                trial_period_days: 60
            },
            allow_promotion_codes: true,
            metadata: {
                gym_setup: "true",
                user_id: user.id,
                gym_name: formData.name,
                slug: formData.slug,
                timezone: formData.timezone,
                plan_type: formData.planType
            },
            success_url: `${origin}/gym/${formData.slug}/dashboard`,
            cancel_url: `${origin}/gym/new?error=checkout_cancelled`,
        }, undefined);

        return NextResponse.json({ url: session.url });
      
    } catch (err) {
        console.error("Error creating checkout session:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}