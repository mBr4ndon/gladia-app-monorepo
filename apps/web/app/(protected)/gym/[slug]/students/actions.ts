"use server";

import { markStudentMembershipPaid } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";
import { requireAdminGymMembership } from "@/lib/utils";

export async function markStudentMembershipPaidAction(
    slug: string,
    studentMembershipId: string,
) {
    const { membership } = await requireAdminGymMembership(slug);

    await markStudentMembershipPaid(studentMembershipId, membership.gymId);

    revalidatePath(`/gym/${slug}/students`);
    revalidatePath(`/gym/${slug}/settings/membership`);
}
