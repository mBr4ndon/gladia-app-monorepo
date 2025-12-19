import { auth } from "@gladia-app/auth/server";
import { getGymBySlug, getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewClassForm from "../_components/new-class-form";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function GymClassesNewPage({ params }: Props) {
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

    if (membership.role !== "admin") {
        redirect(`/gym/${slug}/dashboard`);
    }

    const gym = await getGymBySlug(slug);

    if (!gym) {
        redirect("/onboarding-page");
    }


    return (
        <div className="container mx-auto py-6 sm:py-8 md:py-10 px-4">
            <div className="mx-auto max-w-2xl">
                <NewClassForm
                    slug={slug}
                    gymId={gym.id}
                />
            </div>
        </div>
    );
}