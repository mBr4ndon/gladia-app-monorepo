import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { authDb } from "..";
import { attendance, classe, gym, membership, profile } from "../schema";
import { LeaderboardRow } from "../types";
import { startOfDay } from "../utils";

type GetAttendanceStatsParams = {
    gymId: string;
    date?: Date;
};

export async function getAttendanceStatsForDay({
    gymId,
    date,
}: GetAttendanceStatsParams) {
    const day = startOfDay(date);

    const [row] = await authDb
        .select({
            count: sql<number>`cast(count(*) as int)`,
        })
        .from(attendance)
        .innerJoin(classe, eq(attendance.classId, classe.id))
        .where(
            and(
                eq(classe.gymId, gymId),
                eq(classe.date, day.toISOString()),
            ),
        );

    return {
        totalAttendance: row?.count ?? 0,
    };
}

export async function manualCheckIn(classId: string, userId: string, checkedInBy: string) {
    await authDb
        .insert(attendance)
        .values({
            classId,
            userId,
            checkedByUserId: checkedInBy,
            source: "manual"
        }).onConflictDoNothing();
}

export async function qrCodeCheck(classId: string, userId: string) {
    await authDb
        .insert(attendance)
        .values({
            classId,
            userId,
            source: "qr_code"
        }).onConflictDoNothing();
}

export async function revokeAttendance(attendanceId: string) {
    await authDb
        .delete(attendance)
        .where(eq(attendance.id, attendanceId));
}

export const getGymLeaderboard = async (
    slug: string,
    from?: Date,
    to?: Date,
): Promise<LeaderboardRow[]> => {
    // Count de presenças (apenas conta linhas válidas de attendance)
    const attendancesCount = sql<number>`count(${attendance.id})`.as("attendancesCount");

    // Condições opcionais de data para a JOIN das classes
    const dateConditions: any[] = [];
    if (from) {
        dateConditions.push(gte(classe.date, from.toISOString()));
    }
    if (to) {
        dateConditions.push(lte(classe.date, to.toISOString()));
    }

    const rows = await authDb
        .select({
            userId: membership.userId,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            attendancesCount,
        })
        .from(membership)
        .innerJoin(gym, eq(membership.gymId, gym.id))
        .innerJoin(profile, eq(membership.userId, profile.userId))
        .leftJoin(
            attendance,
            eq(attendance.userId, membership.userId),
        )
        .leftJoin(
            classe,
            and(
                eq(classe.id, attendance.classId),
                eq(classe.gymId, gym.id),
                // estes só entram se existirem:
                ...dateConditions,
            ),
        )
        .where(eq(gym.slug, slug))
        .groupBy(membership.userId, profile.name, profile.avatarUrl)
        .orderBy(desc(attendancesCount));

    return rows;
};