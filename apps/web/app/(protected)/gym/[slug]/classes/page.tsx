import { headers } from "next/headers";
import ClassesPage from "./_components/classes-page";
import { auth } from "@gladia-app/auth/server";
import { getNextClassesForGym, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { redirect } from "next/navigation";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

export default async function GymClassesPage({ params }: Props) {
    const { slug } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session!.user.id;
    const profile = await getProfileWithMembershipsById(userId);

    if (!profile?.memberships.length) {
        redirect("/onboarding-page");
    }

    const membership = profile.memberships.find(
        (m) => m.gym?.slug === slug,
    );

    if (!membership) {
        redirect("/onboarding-page");
    }

    const gymId = membership.gymId;

    if (!gymId) {
        redirect("/onboarding-page");
    }

    const nextClasses = await getNextClassesForGym(gymId);

    return <ClassesPage slug={slug} classes={nextClasses} role={membership.role} userId={userId} />
}