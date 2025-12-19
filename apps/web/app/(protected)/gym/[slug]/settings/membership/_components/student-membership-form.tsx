"use client";

import { useTransition, useState } from "react";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Label } from "@gladia-app/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { assignStudentMembershipAction } from "../actions";

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
                <CardTitle>Assign plan to student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={studentId} onValueChange={setStudentId} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select student" />
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
                        <Label>Plan</Label>
                        <Select value={planId} onValueChange={setPlanId} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
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
                    {isPending ? "Assigning..." : "Assign plan"}
                </Button>
            </CardContent>
        </Card>
    );
}
