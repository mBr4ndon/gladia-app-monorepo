import { getClassById, getGymStudentsBySlug, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { ClassDetailsPage } from "./_components/class-details-page";
import { auth } from "@gladia-app/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
    params: Promise<{ id: string; slug: string }>;
}

export default async function ClassPage({ params }: Props) {
    const { slug, id } = await params;

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

    const cls = await getClassById(id);
    const students = await getGymStudentsBySlug(membership.gymId);

    return (
        <ClassDetailsPage 
            cls={cls!}
            slug={slug}
            role={membership.role}
            userId={membership.userId}
            students={students || []}
        />
    );
}