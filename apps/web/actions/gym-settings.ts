"use server";

import { updateGymCurrency, upsertBeltPromotionRule, deleteGymById } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminGymMembership } from "@/lib/utils";

export async function updateGymCurrencyAction(
    slug: string,
    currency: string,
) {
    const { membership } = await requireAdminGymMembership(slug);

    await updateGymCurrency(membership.gymId, currency as any);

    revalidatePath(`/gym/${slug}/settings/general`);
    revalidatePath(`/gym/${slug}/settings/membership`);
}

export async function saveBeltRuleAction(
    slug: string,
    belt: string,
    requiredClasses: number,
) {
    const { membership } = await requireAdminGymMembership(slug);

    await upsertBeltPromotionRule(membership.gymId, belt, requiredClasses);

    revalidatePath(`/gym/${slug}/settings/training`);
}

export async function deleteGymAction(slug: string) {
    const { membership } = await requireAdminGymMembership(slug);

    await deleteGymById(membership.gymId);

    redirect("/onboarding-page");
}
