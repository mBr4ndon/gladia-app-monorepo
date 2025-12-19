"use server";

import { getClassByQrToken, manualCheckIn, qrCodeCheck, revokeAttendance } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";

function buildClassDateTime(date: Date | string, time: string): Date {
    // Garantir que temos um Date
    const base = date instanceof Date ? new Date(date) : new Date(date);

    // time pode ser "HH:MM" ou "HH:MM:SS"
    const [h, m] = time.split(":").map(Number);
    base.setHours(h ?? 0, m ?? 0, 0, 0);

    return base;
}


export async function manualCheckInAction(
    classId: string,
    userId: string,
    checkedByUserId: string,
    slug: string,
) {
    await manualCheckIn(classId, userId, checkedByUserId);

    revalidatePath(`/gym/${slug}/classes/${classId}`);
}

export async function qrCodeCheckInAction(
    qrToken: string,
    userId: string,
) {
    const classData = await getClassByQrToken(qrToken);

    if (!classData) {
        return { status: "error", message: "Class does not exist" };
    }

    const cls = classData.class;

    // ⏰ construir início e fim da aula corretamente
    const classStart = buildClassDateTime(cls.date, cls.startAt);
    const classEnd = buildClassDateTime(cls.date, cls.endAt);
    const now = new Date();

    const fifteenMinutesBefore = new Date(
        classStart.getTime() - 15 * 60 * 1000,
    );

    // --- Check if already checked-in ---
    const isAlreadyCheckedIn = classData.attendances.some(a => a.userId === userId);

    if (isAlreadyCheckedIn) {
        return { status: "warning", message: "You are already checked-in" };
    }

    // --- Validation: cannot check in after class ends ---
    if (now > classEnd) {
        return { status: "error", message: "This class has already ended" };
    }

    if (now < fifteenMinutesBefore) {
        return {
            status: "warning",
            message: "You can only check-in 15 minutes before the class starts",
        };
    }

    // --- Register attendance ---
    await qrCodeCheck(classData.class.id, userId);

    return {
        status: "success",
        message: "Checked-in successfully",
    };
}

export async function revokeAttendanceAction(
    attendanceId: string,
    classId: string,
    slug: string,
) {
    await revokeAttendance(attendanceId);

    revalidatePath(`/gym/${slug}/classes/${classId}`);
}