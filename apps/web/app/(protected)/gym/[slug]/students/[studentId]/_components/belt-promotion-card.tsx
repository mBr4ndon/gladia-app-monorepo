"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { Button } from "@gladia-app/ui/components/button";
import { Badge } from "@gladia-app/ui/components/badge";
import { BeltBadge } from "@/components/belt-badge";
import { BJJ_BELTS } from "@/lib/belts";
import { promoteStudentBeltAction } from "@/actions/belt-promotion";
import { useTranslations } from "next-intl";

type Props = {
    slug: string;
    studentId: string;
    currentBelt: string | null;
};

export function BeltPromotionCard({ slug, studentId, currentBelt }: Props) {
    const t = useTranslations("studentProfile");
    const [isPending, startTransition] = useTransition();
    const [newBelt, setNewBelt] = useState("");

    const handlePromote = () => {
        if (!newBelt || newBelt === currentBelt) return;
        startTransition(async () => {
            await promoteStudentBeltAction(slug, studentId, newBelt);
            setNewBelt("");
        });
    };

    return (
        <Card className="bg-card/90 shadow-lg shadow-primary/5 border-primary/10">
            <CardHeader>
                <CardTitle>{t("promotion.title")}</CardTitle>
                <CardDescription>{t("promotion.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("promotion.currentLabel")}</span>
                    {currentBelt ? (
                        <BeltBadge belt={currentBelt} />
                    ) : (
                        <Badge variant="outline">{t("belt.notSet")}</Badge>
                    )}
                </div>

                <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">{t("promotion.newLabel")}</span>
                    <Select value={newBelt} onValueChange={setNewBelt} disabled={isPending}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("promotion.newPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                            {BJJ_BELTS.map((belt) => (
                                <SelectItem key={belt.value} value={belt.value}>
                                    <BeltBadge belt={belt.value} />
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handlePromote}
                    disabled={isPending || !newBelt || newBelt === currentBelt}
                >
                    {isPending ? t("promotion.actioning") : t("promotion.action")}
                </Button>
            </CardContent>
        </Card>
    );
}
