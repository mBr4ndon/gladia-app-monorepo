"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, GraduationCap, LinkIcon, ExternalLink, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@gladia-app/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@gladia-app/ui/components/card";
import { Input } from "@gladia-app/ui/components/input";
import { Label } from "@gladia-app/ui/components/label";
import { Switch } from "@gladia-app/ui/components/switch";

import type {
    ProfileRow,
    MembershipRow,
} from "@gladia-app/db/queries";
import { BeltBadge } from "@/components/belt-badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@gladia-app/ui/components/table";
import { Badge } from "@gladia-app/ui/components/badge";
import Link from "next/link";
import { markStudentMembershipPaidAction } from "../actions";
import { useTranslations } from "next-intl";

type Student = {
    profile: ProfileRow;
    membership: MembershipRow & {
        studentMembership?: {
            status: string;
            nextBillingDate: string | null;
            billingCycle?: "monthly" | "yearly" | null;
            id: string;
        };
    };
};

type Props = {
    inviteLink: string;
    students: Student[];
    slug: string;
};

export default function GymStudentsPage({ inviteLink, students, slug }: Props) {
    const [globalQrCode, setGlobalQrCode] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const t = useTranslations("studentsPage");

    useEffect(() => {
        const generateQrCode = async (url: string) => {
            try {
                const qrCodeUrl = await QRCode.toDataURL(url, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                });

                setGlobalQrCode(qrCodeUrl);
            } catch (error) {
                console.error("Error generating QR code:", error);
                setGlobalQrCode(null);
            }
        };

        generateQrCode(inviteLink);
    }, [inviteLink]);

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link).catch((err) => {
            console.error("Failed to copy link:", err);
        });
    };

    const handleMarkPaid = (studentMembershipId: string) => {
        setUpdatingId(studentMembershipId);
        startTransition(async () => {
            await markStudentMembershipPaidAction(slug, studentMembershipId);
            setUpdatingId(null);
        });
    };

    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            {/* Invite link + QR */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" />
                                {t("inviteTitle")}
                            </CardTitle>
                            <CardDescription>
                                {t("inviteDescription")}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="invite-toggle" className="text-sm">
                                {t("enableInvites")}
                            </Label>
                            <Switch
                                id="invite-toggle"
                                checked={true}
                                disabled
                                // onCheckedChange={handleToggleInvite}
                                // disabled={isTogglingInvite}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label>{t("inviteLabel")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyLink(inviteLink)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            {globalQrCode && (
                                <img
                                    src={globalQrCode}
                                    alt="Invite QR Code"
                                    className="border rounded-lg w-32 h-32"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Students list */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("noStudents")}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("table.name")}</TableHead>
                                        <TableHead>{t("table.belt")}</TableHead>
                                        <TableHead>{t("table.status")}</TableHead>
                                        <TableHead>{t("table.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => {
                                        return (
                                            <TableRow key={student.membership.id}>
                                                <TableCell className="font-medium">
                                                    {student.profile.name}
                                                </TableCell>
                                                <TableCell>
                                                    {student.profile.belt ? (
                                                        <BeltBadge belt={student.profile.belt} />
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            {t("table.notSet")}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {student.membership.studentMembership ? (
                                                        <Badge
                                                            variant={
                                                                student.membership.studentMembership.status === "past_due"
                                                                    ? "destructive"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {student.membership.studentMembership.status.replace("_", " ")}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">{t("table.noPlan")}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="space-x-2 whitespace-nowrap">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/gym/${slug}/students/${student.profile.userId}`}>
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            {t("table.view")}
                                                        </Link>
                                                    </Button>

                                                    {student.membership.studentMembership?.status === "past_due" && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleMarkPaid(student.membership.studentMembership!.id)}
                                                            disabled={isPending && updatingId === student.membership.studentMembership.id}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            {isPending && updatingId === student.membership.studentMembership.id
                                                                ? t("table.updating")
                                                                : t("table.markPaid")}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
