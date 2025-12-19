import { auth } from "@gladia-app/auth/server";
import { getGymBySlugAndInvite, getProfileByUserId } from "@gladia-app/db/queries";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { JoinPageClient } from "./_components/join-client";

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function JoinGymPage({ params, searchParams }: PageProps) {
    const { slug } = await params;

    const invite = (await searchParams).invite as string;

    if (!invite) {
        notFound(); // ou mostra um erro mais fofinho
    }

    const gymRow = await getGymBySlugAndInvite(slug, invite);

    if (!gymRow) {
        // invite inválido / desativado
        return (
            <div className="container mx-auto max-w-lg py-16 px-4">
                <h1 className="text-2xl font-bold mb-2">
                    Invalid or expired invite
                </h1>
                <p className="text-muted-foreground">
                    This academy invite link is no longer valid. Please contact
                    your academy to request a new link.
                </p>
            </div>
        );
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const callbackURL = `/join/${slug}?invite=${invite}`;

    let hasBelt = false;

    if (session) {
        const userProfile = await getProfileByUserId(session.user.id);
        hasBelt = !!userProfile?.belt;
    }

    return (
        <JoinPageClient
            isAuthenticated={!!session}
            gymName={gymRow.name}
            slug={slug}
            invite={invite}
            callbackURL={callbackURL}
            hasBelt={hasBelt}
        />
    );
}
