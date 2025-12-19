"use server";

import { awardAchievements, getAchievementTypes, getAttendanceStatsForUserGym, getClassById, getUserAchievementsForGym, updateClassStatus, updateClassTime } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";

export async function updateClassTimeAction(
    classId: string,
    startAt: string,
    endAt: string,
    slug: string,
) {
    await updateClassTime(classId, startAt, endAt);
    revalidatePath(`/gym/${slug}/classes/${classId}`);
}

export async function finishClassAction(
    classId: string,
    slug: string,
) {
    const cls = await getClassById(classId);
    await updateClassStatus(classId, "finished");

    if (cls) {
        await maybeAwardAchievements(cls.class.gymId, cls.attendances.map((a) => a.userId));
    }

    revalidatePath(`/gym/${slug}/classes/${classId}`);
    revalidatePath(`/gym/${slug}/dashboard`);
    revalidatePath(`/gym/${slug}/achievements`);
}

export async function cancelClassAction(
    classId: string,
    slug: string,
) {
    await updateClassStatus(classId, "cancelled");

    revalidatePath(`/gym/${slug}/classes/${classId}`);
}

function parseRequirement(requirement: unknown) {
    if (!requirement || typeof requirement !== "object") return null;

    const req = requirement as Record<string, unknown>;
    const type = typeof req.type === "string" ? req.type : null;
    const count = typeof req.count === "number" ? req.count : Number(req.count);

    if (type !== "streak" && type !== "total") return null;
    if (!type || !Number.isFinite(count)) return null;

    return { type, count };
}

async function maybeAwardAchievements(gymId: string, userIds: string[]) {
    const uniqueUserIds = Array.from(new Set(userIds));

    if (!uniqueUserIds.length) return;

    const achievementTypes = await getAchievementTypes();
    const eligibleTypes = achievementTypes.filter((type) => parseRequirement(type.requirement));

    if (!eligibleTypes.length) return;

    const awards: Array<{ userId: string; gymId: string; type: string; data: Record<string, unknown> }> = [];

    for (const userId of uniqueUserIds) {
        const [userAchievements, attendanceStats] = await Promise.all([
            getUserAchievementsForGym(gymId, userId),
            getAttendanceStatsForUserGym(gymId, userId),
        ]);

        const earned = new Set(userAchievements.map((a) => a.type));

        for (const type of eligibleTypes) {
            const requirement = parseRequirement(type.requirement);
            if (!requirement) continue;

            const progress =
                requirement.type === "streak"
                    ? attendanceStats.currentStreak
                    : attendanceStats.totalClasses;

            if (progress < requirement.count) continue;
            if (earned.has(type.id)) continue;

            awards.push({
                userId,
                gymId,
                type: type.id,
                data: {
                    progress,
                    requirementType: requirement.type,
                    requirementTarget: requirement.count,
                },
            });
        }
    }

    if (awards.length) {
        await awardAchievements(awards);
    }
}
