import { and, desc, eq } from "drizzle-orm";
import { authDb } from "..";
import { membershipPlan, payment, studentMembership } from "../schema";
import type { MembershipPlanRow, PaymentRow, StudentMembershipRow } from "../types";

export async function getMembershipPlansByGym(
    gymId: string,
): Promise<MembershipPlanRow[]> {
    return authDb
        .select()
        .from(membershipPlan)
        .where(eq(membershipPlan.gymId, gymId))
        .orderBy(desc(membershipPlan.createdAt));
}

export async function getGymPayments(
    gymId: string,
): Promise<PaymentRow[]> {
    return authDb
        .select()
        .from(payment)
        .where(eq(payment.gymId, gymId))
        .orderBy(desc(payment.createdAt));
}

export async function createMembershipPlan(plan: Omit<MembershipPlanRow, "id" | "createdAt" | "updatedAt">) {
    const [row] = await authDb
        .insert(membershipPlan)
        .values(plan)
        .returning();
    return row;
}

export async function getStudentMembershipsByGym(
    gymId: string,
): Promise<StudentMembershipRow[]> {
    return authDb
        .select()
        .from(studentMembership)
        .where(eq(studentMembership.gymId, gymId));
}

export async function getStudentMembershipWithPlan(
    gymId: string,
    studentId: string,
) {
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
        .where(
            and(
                eq(studentMembership.gymId, gymId),
                eq(studentMembership.studentId, studentId),
            ),
        )
        .limit(1);

    if (!row) return null;

    return {
        membership: row.membership,
        plan: row.plan,
    };
}

export async function upsertStudentMembership(
    data: Omit<StudentMembershipRow, "id" | "createdAt" | "updatedAt">,
) {
    const existing = await authDb
        .select({ id: studentMembership.id })
        .from(studentMembership)
        .where(
            and(
                eq(studentMembership.studentId, data.studentId),
                eq(studentMembership.gymId, data.gymId),
            ),
        )
        .limit(1);

    if (existing.length > 0) {
        await authDb
            .update(studentMembership)
            .set({
                membershipPlanId: data.membershipPlanId,
                status: data.status,
                paymentMethod: data.paymentMethod,
                stripeSubscriptionId: data.stripeSubscriptionId,
                startDate: data.startDate,
                endDate: data.endDate,
                nextBillingDate: data.nextBillingDate,
                customPrice: data.customPrice,
                customAttendanceLimit: data.customAttendanceLimit,
                notes: data.notes,
                stripeCustomerId: data.stripeCustomerId,
            })
            .where(eq(studentMembership.id, existing[0]!.id));
        return;
    }

    await authDb.insert(studentMembership).values(data);
}
