import { redirect } from "next/navigation";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

export default async function GymSettingsIndexPage({ params }: Props) {
    const { slug } = await params;
    redirect(`/gym/${slug}/settings/general`);
}
