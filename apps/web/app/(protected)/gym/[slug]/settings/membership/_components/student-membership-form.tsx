"use client";

import { useTransition, useState } from "react";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Label } from "@gladia-app/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { assignStudentMembershipAction } from "../actions";
import { useTranslations } from "next-intl";

type StudentOption = {
    id: string;
    name: string;
};

type PlanOption = {
    id: string;
    name: string;
};

type Props = {
    slug: string;
    students: StudentOption[];
    plans: PlanOption[];
};

export function StudentMembershipForm({ slug, students, plans }: Props) {
    const t = useTranslations("settingsMembership");
    const [isPending, startTransition] = useTransition();
    const [studentId, setStudentId] = useState("");
    const [planId, setPlanId] = useState("");

    const handleAssign = () => {
        startTransition(async () => {
            if (!studentId || !planId) return;
            await assignStudentMembershipAction(slug, studentId, planId);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("studentForm.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>{t("studentForm.studentLabel")}</Label>
                        <Select value={studentId} onValueChange={setStudentId} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("studentForm.studentPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("studentForm.planLabel")}</Label>
                        <Select value={planId} onValueChange={setPlanId} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("studentForm.planPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button onClick={handleAssign} disabled={isPending || !studentId || !planId}>
                    {isPending ? t("studentForm.assigning") : t("studentForm.assign")}
                </Button>
            </CardContent>
        </Card>
    );
}
