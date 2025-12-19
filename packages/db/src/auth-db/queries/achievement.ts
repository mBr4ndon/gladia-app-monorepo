import { and, desc, eq, sql } from "drizzle-orm";
import { authDb } from "..";
import { achievement, achievementType, attendance, classe } from "../schema";
import { AchievementStats, AchievementTypeRow, AchievementRow } from "../types";
import { startOfDay } from "../utils";

export async function getAchievementTypes(): Promise<AchievementTypeRow[]> {
    return authDb.select().from(achievementType);
}

export async function getUserAchievementsForGym(
    gymId: string,
    userId: string,
): Promise<AchievementRow[]> {
    return authDb
        .select()
        .from(achievement)
        .where(and(eq(achievement.gymId, gymId), eq(achievement.userId, userId)));
}

export async function getAttendanceStatsForUserGym(
    gymId: string,
    userId: string,
): Promise<AchievementStats> {
    const rows = await authDb
        .select({
            classDate: classe.date,
        })
        .from(attendance)
        .innerJoin(classe, and(eq(attendance.classId, classe.id), eq(classe.gymId, gymId)))
        .where(eq(attendance.userId, userId))
        .orderBy(desc(classe.date));

    const totalClasses = rows.length;

    // Compute current streak based on unique attendance days
    const days = new Set(
        rows.map((row) => {
            const d = new Date(row.classDate);
            d.setHours(0, 0, 0, 0);
            return d.toISOString();
        }),
    );

    let currentStreak = 0;
    let cursor = startOfDay();

    while (days.has(cursor.toISOString())) {
        currentStreak += 1;
        cursor = startOfDay(new Date(cursor.setDate(cursor.getDate() - 1)));
    }

    return {
        totalClasses,
        currentStreak,
    };
}

export async function getAchievementsDataForGymUser(gymId: string, userId: string) {
    const [types, userAchievements, attendanceStats] = await Promise.all([
        getAchievementTypes(),
        getUserAchievementsForGym(gymId, userId),
        getAttendanceStatsForUserGym(gymId, userId),
    ]);

    return {
        achievementTypes: types,
        userAchievements,
        attendanceStats,
    };
}

export async function awardAchievements(
    entries: Array<{
        userId: string;
        gymId: string;
        type: string;
        data?: Record<string, unknown>;
    }>,
) {
    if (!entries.length) return [];

    return authDb
        .insert(achievement)
        .values(entries.map((entry) => ({
            userId: entry.userId,
            gymId: entry.gymId,
            type: entry.type,
            data: entry.data ?? {},
        })))
        .onConflictDoNothing()
        .returning();
}
