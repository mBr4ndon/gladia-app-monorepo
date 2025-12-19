import { eq } from "drizzle-orm";
import { authDb } from "../index";
import { membership, profile, gym } from "../schema";
import type{
  ProfileWithMemberships,
  MembershipRow,
  ProfileRow,
} from "../types";

export const getProfileWithMembershipsById = async (
    userId: string,
): Promise<ProfileWithMemberships | null> => {
    const rows = await authDb
        .select({
            profile,
            membership,
            gym,
        })
        .from(profile)
        .leftJoin(membership, eq(profile.userId, membership.userId))
        .leftJoin(gym, eq(membership.gymId, gym.id))
        .where(eq(profile.userId, userId));

    if (rows.length === 0 || !rows[0]?.profile) {
        return null;
    }

    const baseProfile = rows[0].profile;

    const memberships = rows
        .filter((row) => row.membership !== null)
        .map((row) => ({
            ...(row.membership as MembershipRow),
            gym: row.gym ?? null,
        }));

    return {
        profile: baseProfile,
        memberships,
    };
};

export async function updateProfileBelt(
    userId: string,
    belt: string,
): Promise<void> {
    await authDb
        .update(profile)
        .set({ belt })
        .where(eq(profile.userId, userId));
}

export async function updateProfileLanguage(
    userId: string,
    language: ProfileRow["language"],
): Promise<void> {
    await authDb
        .update(profile)
        .set({ language })
        .where(eq(profile.userId, userId));
}

export async function getProfileByUserId(userId: string) {
    const rows = await authDb
        .select()
        .from(profile)
        .where(eq(profile.userId, userId))
        .limit(1);

    return rows[0] ?? null;
}
