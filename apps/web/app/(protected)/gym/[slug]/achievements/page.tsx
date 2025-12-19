import { auth } from "@gladia-app/auth/server";
import { getAchievementsDataForGymUser, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AchievementsPage } from "./_components/achievements-page";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function AchievementsRoute({ params }: Props) {
    const { slug } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const userId = session.user.id;
    const profile = await getProfileWithMembershipsById(userId);

    if (!profile?.memberships.length) {
        redirect("/onboarding-page");
    }

    const membership = profile.memberships.find((m) => m.gym?.slug === slug);

    if (!membership?.gymId) {
        redirect("/onboarding-page");
    }

    const achievementsData = await getAchievementsDataForGymUser(membership.gymId, userId);

    return (
        <AchievementsPage
            gymName={membership.gym?.name ?? "Gym"}
            achievementTypes={achievementsData.achievementTypes}
            userAchievements={achievementsData.userAchievements}
            attendanceStats={achievementsData.attendanceStats}
        />
    );
}
