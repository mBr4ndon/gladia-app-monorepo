import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { getBeltPromotionRulesByGym } from "@gladia-app/db/queries";
import { requireAdminGymMembership } from "@/lib/utils";
import { TrainingRulesForm } from "./_components/training-rules-form";
import { BJJ_BELTS } from "@/lib/belts";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

export default async function GymSettingsTrainingPage({ params }: Props) {
    const { slug } = await params;
    const { membership } = await requireAdminGymMembership(slug);
    const rules = await getBeltPromotionRulesByGym(membership.gymId);
    const t = await getTranslations("settingsTraining");

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("beltTitle")}</CardTitle>
                    <CardDescription>
                        {t("beltDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TrainingRulesForm
                        slug={slug}
                        rules={BJJ_BELTS.map((belt) => ({
                            belt: belt.value,
                            requiredClasses:
                                rules.find((r) => r.belt === belt.value)?.requiredClasses ?? 0,
                        }))}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
