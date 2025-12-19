import { auth } from "@gladia-app/auth/server";
import { getAchievementsDataForGymUser, getBeltPromotionRulesByGym, getGymDashboardDataBySlug, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";
import { StudentDashboard } from "./_components/student-dashboard";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function GymDashboardPage({ params }: Props) {
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

    const membership = profile.memberships.find(
        (m) => m.gym?.slug === slug,
    );

    if (!membership) {
        redirect("/onboarding-page");
    }
    
    const role = membership!.role;

    if (role === "admin") {
        const dashboardData = await getGymDashboardDataBySlug(slug);

        if (!dashboardData) {
            redirect("/onboarding-page");
        }

        return (
            <AdminDashboard
                gymName={dashboardData.gym.name}
                slug={dashboardData.gym.slug}
                stats={dashboardData.stats}
                todaysClasses={dashboardData.todaysClasses.map((classItem) => ({
                    ...classItem,
                    date: new Date(classItem.date),
                    startAt: new Date(classItem.startAt),
                    endAt: new Date(classItem.endAt),
                }))}
            />
        );
    }
    
    const achievementsData = await getAchievementsDataForGymUser(membership.gymId, userId);
    const beltRules = await getBeltPromotionRulesByGym(membership.gymId);

    const currentBelt = profile.profile.belt;
    const beltRule = currentBelt
        ? beltRules.find((rule) => rule.belt.toLowerCase() === currentBelt.toLowerCase())
        : null;

    const requiredClasses = beltRule?.requiredClasses ?? null;
    const currentClasses = achievementsData.attendanceStats.totalClasses;
    const beltProgress = requiredClasses
        ? {
            belt: currentBelt,
            currentClasses,
            requiredClasses,
            percent: Math.min(100, Math.round((currentClasses / requiredClasses) * 100)),
        }
        : null;

    const achievementTypeById = new Map(
        achievementsData.achievementTypes.map((type) => [type.id, type]),
    );

    const latestAchievements = achievementsData.userAchievements
        .map((ach) => ({
            ...ach,
            earnedAt: ach.earnedAt ? new Date(ach.earnedAt) : null,
        }))
        .sort((a, b) => {
            if (!a.earnedAt || !b.earnedAt) return 0;
            return b.earnedAt.getTime() - a.earnedAt.getTime();
        })
        .slice(0, 6)
        .map((ach) => {
            const type = achievementTypeById.get(ach.type);
            return {
                id: ach.id,
                name: type?.name ?? "Achievement",
                imageUrl: type?.imageUrl ?? null,
            };
        });

    return (
        <StudentDashboard
            slug={slug}
            stats={{
                streak: achievementsData.attendanceStats.currentStreak,
                totalClasses: achievementsData.attendanceStats.totalClasses,
                achievements: achievementsData.userAchievements.length,
            }}
            beltProgress={beltProgress}
            latestAchievements={latestAchievements}
        />
    );
};
