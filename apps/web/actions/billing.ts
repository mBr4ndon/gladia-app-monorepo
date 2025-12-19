"use server";

import { requireAdminGymMembership } from "@/lib/utils";
import { getSubscriptionByGymId, markSubscriptionCanceled, upsertPaymentRecord } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

type SyncResult = {
    ok: boolean;
    message?: string;
};

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

export async function cancelGymSubscriptionAction(slug: string): Promise<SyncResult> {
    if (!stripe) {
        return { ok: false, message: "Stripe key not configured." };
    }

    const { membership } = await requireAdminGymMembership(slug);
    const subscription = await getSubscriptionByGymId(membership.gymId);

    if (!subscription?.stripeSubscriptionId) {
        return { ok: false, message: "No active Stripe subscription." };
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
    });

    await markSubscriptionCanceled(subscription.id);
    revalidatePath(`/gym/${slug}/settings/membership`);

    return { ok: true };
}
