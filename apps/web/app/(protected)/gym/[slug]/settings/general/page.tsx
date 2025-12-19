import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { CurrencyForm } from "./_components/currency-form";
import { requireAdminGymMembership } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

const currencies = ["usd", "eur", "gbp", "brl"];

export default async function GymSettingsGeneralPage({ params }: Props) {
    const { slug } = await params;
    const { membership } = await requireAdminGymMembership(slug);
    const t = await getTranslations("settingsGeneral");

    const currentCurrency = membership.gym?.defaultCurrency ?? "usd";

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("currencyTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <CurrencyForm
                        slug={slug}
                        currentCurrency={currentCurrency}
                        currencies={currencies}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
