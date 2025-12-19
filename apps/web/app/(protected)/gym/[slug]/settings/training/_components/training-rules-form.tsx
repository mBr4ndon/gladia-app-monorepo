"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Input } from "@gladia-app/ui/components/input";
import { Label } from "@gladia-app/ui/components/label";
import { Button } from "@gladia-app/ui/components/button";
import { saveBeltRuleAction } from "@/actions/gym-settings";
import { BJJ_BELTS } from "@/lib/belts";
import { useTranslations } from "next-intl";

type Rule = {
    belt: string;
    requiredClasses: number;
};

type Props = {
    slug: string;
    rules: Rule[];
};

export function TrainingRulesForm({ slug, rules }: Props) {
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState<Record<string, number>>(() => {
        const map: Record<string, number> = {};
        rules.forEach((rule) => {
            map[rule.belt] = rule.requiredClasses;
        });
        return map;
    });
    const t = useTranslations("settingsTraining");

    const mergedBelts = useMemo(
        () =>
            BJJ_BELTS.map((belt) => ({
                ...belt,
                requiredClasses: formState[belt.value] ?? 0,
            })),
        [formState],
    );

    const handleChange = (belt: string, value: string) => {
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) return;
        setFormState((prev) => ({ ...prev, [belt]: num }));
    };

    const handleSave = (belt: string) => {
        const requiredClasses = formState[belt] ?? 0;
        startTransition(async () => {
            await saveBeltRuleAction(slug, belt, requiredClasses);
        });
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {mergedBelts.map((belt) => (
                <Card key={belt.value}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <span className="inline-flex h-6 min-w-[48px] items-center justify-center rounded border px-2 text-xs font-semibold"
                                style={{ background: belt.color, color: belt.textColor, borderColor: "hsl(var(--border))" }}>
                                {belt.label}
                            </span>
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave(belt.value)}
                            disabled={isPending}
                        >
                            {isPending ? t("saving") : t("save")}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor={`rule-${belt.value}`}>{t("classesRequired")}</Label>
                        <Input
                            id={`rule-${belt.value}`}
                            type="number"
                            min={0}
                            value={formState[belt.value] ?? 0}
                            onChange={(e) => handleChange(belt.value, e.target.value)}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t("ruleHelp")}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
