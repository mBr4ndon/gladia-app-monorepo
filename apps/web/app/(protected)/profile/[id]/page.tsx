import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Badge } from "@gladia-app/ui/components/badge";
import { Progress } from "@gladia-app/ui/components/progress";
import { getProfileWithMembershipsById, getAttendanceStatsForUserGym, getBeltPromotionRulesByGym, getStudentMembershipWithPlan } from "@gladia-app/db/queries";
import { BeltBadge } from "@/components/belt-badge";
import { requireAdminGymMembership } from "@/lib/utils";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StudentProfilePage({ params, searchParams }: Props) {
    const { id } = await params;
    const search = await searchParams;
    const gymSlug = typeof search.gym === "string" ? search.gym : null;

    if (!gymSlug) {
        redirect("/onboarding-page");
    }

    const { membership: viewerMembership } = await requireAdminGymMembership(gymSlug);

    const studentProfile = await getProfileWithMembershipsById(id);
    if (!studentProfile) {
        notFound();
    }

    const studentMembership = studentProfile.memberships.find((m) => m.gym?.id === viewerMembership.gymId);
    if (!studentMembership) {
        notFound();
    }

    const [attendanceStats, beltRules, studentMembershipDetail] = await Promise.all([
        getAttendanceStatsForUserGym(viewerMembership.gymId, id),
        getBeltPromotionRulesByGym(viewerMembership.gymId),
        getStudentMembershipWithPlan(viewerMembership.gymId, id),
    ]);

    const currentBelt = studentProfile.profile.belt;
    const beltRule = currentBelt
        ? beltRules.find((rule) => rule.belt.toLowerCase() === currentBelt.toLowerCase())
        : null;

    const requiredClasses = beltRule?.requiredClasses ?? null;
    const currentClasses = attendanceStats.totalClasses;
    const progressPercent = requiredClasses
        ? Math.min(100, Math.round((currentClasses / requiredClasses) * 100))
        : null;

    const membershipStatus = studentMembershipDetail?.membership.status ?? "unknown";
    const nextBillingDate = studentMembershipDetail?.membership.nextBillingDate
        ? new Date(studentMembershipDetail.membership.nextBillingDate).toLocaleDateString()
        : null;
    const planName = studentMembershipDetail?.plan?.name ?? "N/A";
    const billingCycle = studentMembershipDetail?.plan?.billingCycle ?? "monthly";

    return (
        <div className="container mx-auto space-y-6 sm:space-y-8 py-6 px-4">
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Student profile
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold">{studentProfile.profile.name}</h1>
                <p className="text-muted-foreground">
                    Viewing membership details for this academy.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Membership</CardTitle>
                        <CardDescription>Current status and plan details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={membershipStatus === "past_due" ? "destructive" : "outline"}>
                                {membershipStatus.replace("_", " ")}
                            </Badge>
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">{planName}</div>
                            <div className="text-muted-foreground capitalize">{billingCycle}</div>
                            {nextBillingDate && (
                                <div className="text-muted-foreground">
                                    Next billing: {nextBillingDate}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Belt</CardTitle>
                        <CardDescription>Current rank and progress.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            {currentBelt ? <BeltBadge belt={currentBelt} /> : <span className="text-muted-foreground">Not set</span>}
                        </div>

                        {beltRule ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress to next stripe</span>
                                    <span className="font-medium">
                                        {currentClasses} / {requiredClasses} classes
                                    </span>
                                </div>
                                <Progress value={progressPercent ?? 0} />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No belt rule configured for this belt yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
