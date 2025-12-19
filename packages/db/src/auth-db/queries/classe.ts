import { and, eq, gte, lte } from "drizzle-orm";
import { authDb } from "..";
import { attendance, classe } from "../schema";
import type { AttendanceRow, Class, ClassRow, ClassWithAttendances } from "../types";
import { startOfDay } from "../utils";

type GetClassesForGymParams = {
    gymId: string;
    from?: Date;
    to?: Date;
};

export async function getClassesForGym({
    gymId,
    from,
    to,
}: GetClassesForGymParams): Promise<Class[]> {
    const conditions = [eq(classe.gymId, gymId)] as any[];

    if (from) {
        conditions.push(gte(classe.date, startOfDay(from).toISOString()));
    }

    if (to) {
        conditions.push(lte(classe.date, startOfDay(to).toISOString()));
    }

    return authDb
        .select({
            id: classe.id,
            title: classe.title,
            date: classe.date,
            status: classe.status,
            startAt: classe.startAt,
            endAt: classe.endAt,
            qrToken: classe.qrToken,
            modality: classe.modality,
            coachName: classe.coachName,
            capacity: classe.capacity,
        })
        .from(classe)
        .where(and(...conditions))
        .orderBy(classe.date, classe.startAt);
}

export async function getClassById(id: string): Promise<ClassWithAttendances | null> {
    const rows = await authDb
        .select({
            class: classe,
            attendance,
        })
        .from(classe)
        .leftJoin(attendance, eq(attendance.classId, classe.id))
        .where(eq(classe.id, id));

    if (!rows.length) {
        return null;
    }

    const classRow: ClassRow = rows[0]!.class;

    const attendances: AttendanceRow[] = rows
        .filter((row) => row.attendance !== null)
        .map((row) => row.attendance as AttendanceRow);

    return {
        class: classRow,
        attendances,
    };
}

export async function getClassByQrToken(id: string): Promise<ClassWithAttendances | null> {
    const rows = await authDb
        .select({
            class: classe,
            attendance,
        })
        .from(classe)
        .leftJoin(attendance, eq(attendance.classId, classe.id))
        .where(eq(classe.qrToken, id));

    if (!rows.length) {
        return null;
    }

    const classRow: ClassRow = rows[0]!.class;

    const attendances: AttendanceRow[] = rows
        .filter((row) => row.attendance !== null)
        .map((row) => row.attendance as AttendanceRow);

    return {
        class: classRow,
        attendances,
    };
}

export async function getTodayClassesForGym(gymId: string): Promise<Class[]> {
    const today = startOfDay();
    return getClassesForGym({ gymId, from: today, to: today });
}

export async function getNextClassesForGym(gymId: string): Promise<Class[]> {
    const today = startOfDay();
    return getClassesForGym({ gymId, from: today });
}

export async function updateClassStatus(classId: string, status: ClassRow["status"]): Promise<void> {
    await authDb
        .update(classe)
        .set({
            status,
            updatedAt: new Date(), 
        })
        .where(eq(classe.id, classId));
}

export async function updateClassTime(classId: string, startAt: string, endAt: string): Promise<void> {
    await authDb
        .update(classe)
        .set({
            startAt,
            endAt,
            updatedAt: new Date(),
        })
        .where(eq(classe.id, classId));
}