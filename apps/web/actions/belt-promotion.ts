"use server";

import { getProfileWithMembershipsById, recordBeltPromotion } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";
import { requireAdminGymMembership } from "@/lib/utils";
import { BJJ_BELTS } from "@/lib/belts";

export async function promoteStudentBeltAction(
    slug: string,
    studentId: string,
    newBelt: string,
) {
    const { membership } = await requireAdminGymMembership(slug);

    const validBelt = BJJ_BELTS.some((belt) => belt.value === newBelt);
    if (!validBelt) {
        throw new Error("Invalid belt");
    }

    const studentProfile = await getProfileWithMembershipsById(studentId);
    if (!studentProfile) {
        throw new Error("Student not found");
    }

    const studentMembership = studentProfile.memberships.find(
        (m) => m.gymId === membership.gymId,
    );

    if (!studentMembership) {
        throw new Error("Student not in gym");
    }

    const previousBelt = studentProfile.profile.belt ?? null;
    if (previousBelt === newBelt) {
        return;
    }

    await recordBeltPromotion({
        gymId: membership.gymId,
        userId: studentId,
        promotedBy: membership.id,
        previousBelt,
        newBelt,
    });

    revalidatePath(`/gym/${slug}/students/${studentId}`);
    revalidatePath(`/gym/${slug}/students`);
}
