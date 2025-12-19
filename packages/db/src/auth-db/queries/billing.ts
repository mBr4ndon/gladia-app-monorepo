import { authDb } from "..";
import { membershipPlan, payment, studentMembership, subscription } from "../schema";
import { PaymentRow, SubscriptionRow } from "../types";
import { and, eq, isNotNull, lte } from "drizzle-orm";

export async function getSubscriptionByGymId(gymId: string): Promise<SubscriptionRow | null> {
    const rows = await authDb
        .select()
        .from(subscription)
        .where(eq(subscription.gymId, gymId))
        .limit(1);

    return rows[0] ?? null;
}

export async function upsertPaymentRecord(data: PaymentRow) {
    const conflictTarget = data.stripePaymentIntentId
        ? payment.stripePaymentIntentId
        : payment.stripeInvoiceId;

    if (!conflictTarget) {
        await authDb.insert(payment).values(data);
        return;
    }

    await authDb
        .insert(payment)
        .values(data)
        .onConflictDoUpdate({
            target: conflictTarget,
            set: {
                amount: data.amount,
                currency: data.currency,
                status: data.status,
                description: data.description,
                receiptUrl: data.receiptUrl,
                invoicePdfUrl: data.invoicePdfUrl,
                paymentDate: data.paymentDate,
            },
        });
}

export async function markSubscriptionCanceled(subId: string) {
    await authDb
        .update(subscription)
        .set({
            status: "canceled",
            canceledAt: new Date(),
        })
        .where(eq(subscription.id, subId));
}

export async function getExpiredStudentMemberships(today: Date) {
    return await authDb
        .select({
            id: studentMembership.id,
            nextBillingDate: studentMembership.nextBillingDate,
        })
        .from(studentMembership)
        .where(
            and(
                eq(studentMembership.status, "active"),
                isNotNull(studentMembership.nextBillingDate),
                lte(studentMembership.nextBillingDate, today.toISOString()),
            ),
        );
}

export async function updateStudentMembershipStatus(m: { id: string }) {
    await authDb
        .update(studentMembership)
        .set({
            status: "past_due",
            updatedAt: new Date(),
        })
        .where(eq(studentMembership.id, m.id));
}

export async function markStudentMembershipPaid(id: string, gymId: string) {
    const [row] = await authDb
        .select({
            membership: studentMembership,
            plan: membershipPlan,
        })
        .from(studentMembership)
        .leftJoin(
            membershipPlan,
            eq(studentMembership.membershipPlanId, membershipPlan.id),
        )
        .where(and(eq(studentMembership.id, id), eq(studentMembership.gymId, gymId)))
        .limit(1);

    const membershipRow = row?.membership;
    const plan = row?.plan;

    if (!membershipRow) {
        throw new Error("Student membership not found for this gym.");
    }

    const now = new Date();
    const baseDate = membershipRow.nextBillingDate
        ? new Date(membershipRow.nextBillingDate)
        : now;

    const effectiveBase = baseDate < now ? now : baseDate;

    const nextBilling = new Date(effectiveBase);
    if (plan?.billingCycle === "yearly") {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
    }

    await authDb
        .update(studentMembership)
        .set({
            status: "active",
            nextBillingDate: nextBilling.toISOString(),
            updatedAt: new Date(),
        })
        .where(eq(studentMembership.id, id));

    return {
        nextBillingDate: nextBilling.toISOString(),
        status: "active",
    };
}
