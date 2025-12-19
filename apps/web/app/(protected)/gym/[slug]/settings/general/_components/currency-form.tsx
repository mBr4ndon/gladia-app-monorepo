"use client";

import { useTransition, useState } from "react";
import { Button } from "@gladia-app/ui/components/button";
import { Label } from "@gladia-app/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { updateGymCurrencyAction } from "@/actions/gym-settings";
import { useTranslations } from "next-intl";

type Props = {
    slug: string;
    currentCurrency: string;
    currencies: string[];
};

export function CurrencyForm({ slug, currentCurrency, currencies }: Props) {
    const [value, setValue] = useState(currentCurrency);
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("settingsGeneral");

    const handleSave = () => {
        startTransition(async () => {
            if (value === currentCurrency) return;
            await updateGymCurrencyAction(slug, value);
        });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label>{t("currencyLabel")}</Label>
                <Select value={value} onValueChange={setValue} disabled={isPending}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {currencies.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c.toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                    {t("currencyHint")}
                </p>
            </div>

            <Button onClick={handleSave} disabled={isPending || value === currentCurrency}>
                {isPending ? t("saving") : t("save")}
            </Button>
        </div>
    );
}
