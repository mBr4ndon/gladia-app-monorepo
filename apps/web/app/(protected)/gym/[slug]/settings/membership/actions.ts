"use server";

import { requireAdminGymMembership } from "@/lib/utils";
import { createMembershipPlan, upsertStudentMembership } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";

type CreatePlanInput = {
    name: string;
    description?: string;
    price: number;
    currency: string;
    billingCycle: "monthly" | "yearly";
    attendanceLimitType: "unlimited" | "fixed";
    attendanceLimit?: number | null;
};

export async function createMembershipPlanAction(slug: string, input: CreatePlanInput) {
    const { membership } = await requireAdminGymMembership(slug);

    await createMembershipPlan({
        gymId: membership.gymId,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        currency: input.currency,
        billingCycle: input.billingCycle,
        attendanceLimitType: input.attendanceLimitType,
        attendanceLimit: input.attendanceLimitType === "fixed" ? input.attendanceLimit ?? 0 : null,
        isActive: true,
    });

    revalidatePath(`/gym/${slug}/settings/membership`);
}

function getFirstDayOfNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export async function assignStudentMembershipAction(
    slug: string,
    studentId: string,
    planId: string,
) {
    const { membership } = await requireAdminGymMembership(slug);

    const now = new Date();

    await upsertStudentMembership({
        studentId,
        gymId: membership.gymId,
        membershipPlanId: planId,
        status: "active",
        paymentMethod: "manual",
        stripeSubscriptionId: null,
        startDate: now.toISOString(),
        nextBillingDate: getFirstDayOfNextMonth(now).toISOString(),
        endDate: null,
        customPrice: null,
        customAttendanceLimit: null,
        notes: null,
        stripeCustomerId: null,
    });

    revalidatePath(`/gym/${slug}/settings/membership`);
}
