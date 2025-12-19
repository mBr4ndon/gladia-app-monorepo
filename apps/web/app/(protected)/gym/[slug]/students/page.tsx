// app/gym/[slug]/students/page.tsx
import { notFound } from "next/navigation";
import { getGymWithStudentsBySlug } from "@gladia-app/db/queries";
import GymStudentsPage from "./_components/gym-students-page";

type Props = {
    params: Promise<{ slug: string }>;
};

const APP_URL =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

function generateInviteLink(slug: string, inviteToken: string) {
    // ajusta o path como quiseres: /join, /invite, etc.
    return `${APP_URL}/join/${slug}?invite=${inviteToken}`;
}

export default async function GymStudentsPageServer({ params }: Props) {
    const { slug } = await params;

    const data = await getGymWithStudentsBySlug(slug);

    if (!data) {
        notFound();
    }

    const inviteLink = generateInviteLink(
        data.gym.slug,
        data.gym.inviteToken,
    );

    return (
        <GymStudentsPage
            inviteLink={inviteLink}
            students={data.students}
            slug={slug}
        />
    );
}
