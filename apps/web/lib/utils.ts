import { auth } from "@gladia-app/auth/server";
import { getProfileWithMembershipsById, type MembershipRow, type GymRow } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type MembershipWithGym = MembershipRow & { gym: GymRow | null };

export async function requireAdminGymMembership(slug: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const profile = await getProfileWithMembershipsById(session.user.id);

    if (!profile?.memberships.length) {
        redirect("/onboarding-page");
    }

    const membership = profile.memberships.find(
        (m) => m.gym?.slug === slug,
    ) as MembershipWithGym | undefined;

    if (!membership || membership.role !== "admin") {
        redirect("/onboarding-page");
    }

    return {
        membership,
        userId: session.user.id,
        profile,
    };
}
