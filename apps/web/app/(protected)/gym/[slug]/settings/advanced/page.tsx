import { requireAdminGymMembership } from "@/lib/utils";
import { DeleteGymCard } from "./_components/delete-gym-card";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

export default async function GymSettingsAdvancedPage({ params }: Props) {
    const { slug } = await params;
    const { membership } = await requireAdminGymMembership(slug);
    const t = await getTranslations("settingsAdvanced");

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-muted-foreground">
                    {t("subtitle", { gymName: membership.gym?.name ?? "this academy" })}
                </p>
            </div>

            <DeleteGymCard slug={slug} gymName={membership.gym?.name} />
        </div>
    );
}
