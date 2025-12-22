// app/actions/create-classes.ts
"use server";

import {
    eachDayOfInterval,
    getDay
} from "date-fns";

import { auth } from "@gladia-app/auth/server";
import { createClassesSchema, type CreateClassesData } from "@gladia-app/validation";
import { headers } from "next/headers";
import { authDb } from "@gladia-app/db/auth-db";
import { classe } from "@gladia-app/db/schema";

export async function createRecurringClassesAction(
    rawData: CreateClassesData,
    gymId: string,
) {
    const modalityMap: Record<CreateClassesData["modality"], typeof classe.$inferInsert["modality"]> = {
        gi: "gi",
        nogi: "no_gi",
        kids: "kids",
        open_mat: "open_mat",
    };

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthenticated");
    }

    const data = createClassesSchema.parse(rawData);

    const allDates = eachDayOfInterval({
        start: data.startDate,
        end: data.endDate,
    });

    const datesToCreate = allDates.filter((date) =>
        data.selectedDays.includes(getDay(date)),
    );

    if (!datesToCreate.length) return;

    for (const date of datesToCreate) {
        await authDb.insert(classe).values({
            gymId,
            title: data.title,
            date: date.toISOString(),
            startAt: data.startAt,
            endAt: data.endAt,
            modality: modalityMap[data.modality],
            capacity: data.capacity
                ? parseInt(data.capacity, 10)
                : null,
            coachName: data.coachName || null,
            status: "active",
            qrToken: crypto.randomUUID(),
        });
    }
}
