"use server";

import { auth } from "@gladia-app/auth/server";
import { ensureMembershipForUser, getGymBySlugAndInvite, updateProfileBelt } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function joinAcademyAction(slug: string, invite: string, belt?: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        const callbackURL = `/join/${slug}?invite=${invite}`;
        redirect(`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`);
    }

    const userId = session!.user.id;

    const gymRow = await getGymBySlugAndInvite(slug, invite);
    if (!gymRow) {
        throw new Error("This invite is invalid or has expired.");
    }

    if (belt && belt.trim().length > 0) {
        await updateProfileBelt(userId, belt.trim());
    }

    await ensureMembershipForUser(userId, gymRow, "student");

    redirect(`/gym/${slug}/dashboard`);
}
