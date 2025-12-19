import { auth } from "@gladia-app/auth/server";
import { getGymLeaderboard, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LeaderboardPage } from "./_components/leaderboard-page";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    return d;
};

const getStartOfMonth = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
};

const addRanks = (entries: Awaited<ReturnType<typeof getGymLeaderboard>>) =>
    entries.map((entry, index) => ({
        userId: entry.userId,
        name: entry.name,
        avatarUrl: entry.avatarUrl,
        classesAttended: entry.attendancesCount,
        rank: index + 1,
    }));

export default async function GymLeaderboardPage({ params }: Props) {
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

    const now = new Date();
    const [weekRows, monthRows, allRows] = await Promise.all([
        getGymLeaderboard(slug, getStartOfWeek(now), now),
        getGymLeaderboard(slug, getStartOfMonth(now), now),
        getGymLeaderboard(slug),
    ]);

    const leaderboard = {
        week: addRanks(weekRows),
        month: addRanks(monthRows),
        all: addRanks(allRows),
    };

    return (
        <LeaderboardPage
            gymName={membership.gym?.name ?? "Gym"}
            leaderboard={leaderboard}
        />
    );
}
