"use client";

import { useState, useTransition } from "react";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Input } from "@gladia-app/ui/components/input";
import { Label } from "@gladia-app/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { createMembershipPlanAction } from "../actions";

type Props = {
    slug: string;
    defaultCurrency: string;
};

export function PlanForm({ slug, defaultCurrency }: Props) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [attendanceLimitType, setAttendanceLimitType] = useState<"unlimited" | "fixed">("unlimited");
    const [attendanceLimit, setAttendanceLimit] = useState("");

    const handleSubmit = () => {
        startTransition(async () => {
            const numericPrice = Math.max(0, Math.round(Number(price) * 100));
            const limit =
                attendanceLimitType === "fixed" && attendanceLimit
                    ? Math.max(0, Number(attendanceLimit))
                    : null;

            await createMembershipPlanAction(slug, {
                name,
                description,
                price: numericPrice,
                currency: defaultCurrency,
                billingCycle,
                attendanceLimitType,
                attendanceLimit: limit,
            });

            setName("");
            setDescription("");
            setPrice("");
            setAttendanceLimit("");
            setAttendanceLimitType("unlimited");
            setBillingCycle("monthly");
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create membership plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="plan-name">Name</Label>
                    <Input
                        id="plan-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Unlimited Monthly"
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="plan-description">Description</Label>
                    <Input
                        id="plan-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional"
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="plan-price">Price ({defaultCurrency.toUpperCase()})</Label>
                    <Input
                        id="plan-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isPending}
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Billing cycle</Label>
                        <Select
                            value={billingCycle}
                            onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Attendance limit</Label>
                        <Select
                            value={attendanceLimitType}
                            onValueChange={(v) => setAttendanceLimitType(v as "unlimited" | "fixed")}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                        </Select>
                        {attendanceLimitType === "fixed" && (
                            <Input
                                type="number"
                                min="0"
                                value={attendanceLimit}
                                onChange={(e) => setAttendanceLimit(e.target.value)}
                                placeholder="Classes per period"
                                disabled={isPending}
                            />
                        )}
                    </div>
                </div>

                <Button onClick={handleSubmit} disabled={isPending || !name || !price}>
                    {isPending ? "Saving..." : "Create plan"}
                </Button>
            </CardContent>
        </Card>
    );
}
