import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Badge } from "@gladia-app/ui/components/badge";
import { Progress } from "@gladia-app/ui/components/progress";
import { Button } from "@gladia-app/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@gladia-app/ui/components/avatar";
import { CalendarDays, GraduationCap, ArrowLeft, CreditCard, TrendingUp, LineChart } from "lucide-react";
import { getAttendanceStatsForUserGym, getBeltPromotionRulesByGym, getProfileWithMembershipsById, getStudentMembershipWithPlan } from "@gladia-app/db/queries";
import { BeltBadge } from "@/components/belt-badge";
import { requireAdminGymMembership } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{ slug: string; studentId: string }>;
};

const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString() : "—";

export default async function StudentProfilePage({ params }: Props) {
    const { slug, studentId } = await params;
    const t = await getTranslations("studentProfile");

    const { membership: adminMembership } = await requireAdminGymMembership(slug);

    const studentProfile = await getProfileWithMembershipsById(studentId);
    if (!studentProfile) {
        notFound();
    }

    const studentMembership = studentProfile.memberships.find(
        (m) => m.gymId === adminMembership.gymId,
    );

    if (!studentMembership) {
        notFound();
    }

    const [attendanceStats, beltRules, studentMembershipDetail] = await Promise.all([
        getAttendanceStatsForUserGym(adminMembership.gymId, studentId),
        getBeltPromotionRulesByGym(adminMembership.gymId),
        getStudentMembershipWithPlan(adminMembership.gymId, studentId),
    ]);

    const currentBelt = studentProfile.profile.belt;
    const beltRule = currentBelt
        ? beltRules.find((rule) => rule.belt.toLowerCase() === currentBelt.toLowerCase())
        : null;

    const requiredClasses = beltRule?.requiredClasses ?? null;
    const currentClasses = attendanceStats.totalClasses;
    const progressPercent = requiredClasses
        ? Math.min(100, Math.round((currentClasses / requiredClasses) * 100))
        : 0;

    const membershipStatus = studentMembershipDetail?.membership.status ?? "unknown";
    const nextBillingDate = studentMembershipDetail?.membership.nextBillingDate
        ? new Date(studentMembershipDetail.membership.nextBillingDate).toLocaleDateString()
        : null;
    const startDate = studentMembershipDetail?.membership.startDate ?? null;
    const paymentMethod = studentMembershipDetail?.membership.paymentMethod ?? "manual";
    const planName = studentMembershipDetail?.plan?.name ?? "No plan";
    const billingCycle = studentMembershipDetail?.plan?.billingCycle ?? "monthly";

    return (
        <div className="container mx-auto space-y-6 sm:space-y-8 py-6 px-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/gym/${slug}/students`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("breadcrumb")}
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
            </div>

            <Card className="bg-card/90 shadow-lg shadow-primary/5 border-primary/10">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCap className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={studentProfile.profile.avatarUrl!} alt={studentProfile.profile.name ?? "Student"} />
                            <AvatarFallback>{(studentProfile.profile.name ?? "S").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="text-xl font-semibold">{studentProfile.profile.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {t("membership.startDate")}: {formatDate(studentMembership.createdAt.toISOString())}
                            </div>
                            {currentBelt ? <BeltBadge belt={currentBelt} /> : <Badge variant="outline">{t("belt.notSet")}</Badge>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center md:text-right md:grid-cols-2">
                        <div>
                            <p className="flex items-center justify-center md:justify-end gap-1 text-sm text-muted-foreground">
                                <LineChart className="h-4 w-4" /> {t("progress.title")}
                            </p>
                            <p className="text-2xl font-bold">{attendanceStats.totalClasses}</p>
                        </div>
                        <div>
                            <p className="flex items-center justify-center md:justify-end gap-1 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4" /> {t("progress.description")}
                            </p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/90 shadow-lg shadow-primary/5 border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t("membership.title")}
                    </CardTitle>
                    <CardDescription>{t("membership.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("membership.status")}</span>
                            <Badge variant={membershipStatus === "past_due" ? "destructive" : "outline"}>
                                {membershipStatus.replace("_", " ")}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("membership.plan")}</span>
                            <span className="font-medium">{planName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("membership.paymentMethod")}</span>
                            <Badge variant="outline" className="capitalize">
                                {paymentMethod}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("membership.startDate")}</span>
                            <span className="font-medium">{formatDate(startDate)}</span>
                        </div>
                        {nextBillingDate && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t("membership.nextBilling")}</span>
                                <span className="font-medium">{nextBillingDate}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("membership.billingCycle")}</span>
                            <span className="font-medium capitalize">{billingCycle}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/90 shadow-lg shadow-primary/5 border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {t("progress.title")}
                    </CardTitle>
                    <CardDescription>{t("progress.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {beltRule ? (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("belt.progressTitle")}</span>
                                <span className="font-medium">
                                    {currentClasses} / {requiredClasses}
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {t("belt.completed")}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {t("belt.noRule")}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
