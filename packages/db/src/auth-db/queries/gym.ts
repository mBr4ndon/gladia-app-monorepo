import { and, eq } from "drizzle-orm";
import { authDb } from "..";
import { currencyEnum, gym, profile, membership, studentMembership, membershipPlan } from "../schema";
import type { GymWithStudents, ProfileRow, MembershipRow, GymRow, GymStudents, StudentMembershipRow, MembershipPlanRow } from "../types";


export async function getGymWithStudentsBySlug(
    slug: string,
): Promise<GymWithStudents | null> {
    const rows = await authDb
        .select({
            gym,
            profile,
            membership,
            studentMembership,
            membershipPlan,
        })
        .from(gym)
        .leftJoin(
            membership,
            and(
                eq(membership.gymId, gym.id),
                eq(membership.role, "student"),
            ),
        )
        .leftJoin(profile, eq(profile.userId, membership.userId))
        .leftJoin(
            studentMembership,
            and(
                eq(studentMembership.studentId, membership.userId),
                eq(studentMembership.gymId, gym.id),
            ),
        )
        .leftJoin(
            membershipPlan,
            eq(studentMembership.membershipPlanId, membershipPlan.id),
        )
        .where(eq(gym.slug, slug));

    // se não existir gym com esse slug
    if (rows.length === 0 || !rows[0]?.gym) {
        return null;
    }

    const baseGym = rows[0].gym;

    const students = rows
        .filter((row) => row.membership && row.profile)
        .map((row) => ({
            profile: row.profile as ProfileRow,
            membership: {
                ...(row.membership as MembershipRow),
                studentMembership: row.studentMembership
                    ? {
                        ...(row.studentMembership as StudentMembershipRow),
                        membershipPlan: row.membershipPlan as MembershipPlanRow | null,
                    }
                    : undefined,
            },
        }));

    return {
        gym: baseGym,
        students,
    };
}

export async function getGymBySlug(slug: string) {
    const [row] = await authDb
        .select()
        .from(gym)
        .where(eq(gym.slug, slug))
        .limit(1);

    return row ?? null;
}

export async function getGymBySlugAndInvite(
    slug: string,
    inviteToken: string,
): Promise<GymRow | null> {
    const rows = await authDb
        .select()
        .from(gym)
        .where(
            and(
                eq(gym.slug, slug),
                eq(gym.inviteToken, inviteToken),
                eq(gym.inviteEnabled, true),
            ),
        )
        .limit(1);

    if (rows.length === 0) {
        return null;
    }

    return rows[0]!;
}

export async function ensureMembershipForUser(
    userId: string,
    gymRow: GymRow,
    role: "student" | "admin" = "student",
): Promise<void> {
    const existing = await authDb
        .select()
        .from(membership)
        .where(
            and(
                eq(membership.userId, userId),
                eq(membership.gymId, gymRow.id),
            ),
        )
        .limit(1);

    if (existing.length > 0) {
        return;
    }

    await authDb.insert(membership).values({
        userId,
        gymId: gymRow.id,
        role,
    });
}

export async function getGymStudentsBySlug(gymId: string): Promise<GymStudents[] | null> {
    const rows = await authDb
        .select()
        .from(membership)
        .leftJoin(profile, eq(profile.userId, membership.userId))
        .where(and(eq(membership.gymId, gymId), eq(membership.role, "student")));

    if (!rows || !rows.length) {
        return null;
    }

    return rows.map(r => ({
        membership: r.memberships,
        profile: r.profiles
    } as GymStudents));
}

export async function updateGymCurrency(
    gymId: string,
    currency: (typeof currencyEnum.enumValues)[number],
) {
    await authDb
        .update(gym)
        .set({ defaultCurrency: currency })
        .where(eq(gym.id, gymId));
}

export async function deleteGymById(gymId: string) {
    await authDb.delete(gym).where(eq(gym.id, gymId));
}
