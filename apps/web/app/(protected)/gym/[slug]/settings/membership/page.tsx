import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Badge } from "@gladia-app/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gladia-app/ui/components/table";
import { getGymStudentsBySlug, getMembershipPlansByGym, getStudentMembershipsByGym, getSubscriptionByGymId } from "@gladia-app/db/queries";
import { PlanForm } from "./_components/plan-form";
import { StudentMembershipForm } from "./_components/student-membership-form";
import Stripe from "stripe";
import { requireAdminGymMembership } from "@/lib/utils";
import { MembershipActions } from "../billing/_components/membership-actions";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);

const stripeClient = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

async function getStripePayments(customerId: string) {
    if (!stripeClient) return [];

    const [paymentIntents, invoices] = await Promise.all([
        stripeClient.paymentIntents.list({ customer: customerId, limit: 50 }),
        stripeClient.invoices.list({ customer: customerId, limit: 50 }),
    ]);

    const payments: Array<{
        id: string;
        description: string;
        amount: number;
        currency: string;
        status: string;
        paymentDate: Date;
    }> = [];

    for (const pi of paymentIntents.data) {
        if (pi.status === "succeeded") {
            payments.push({
                id: pi.id,
                description: pi.description || "One-time payment",
                amount: pi.amount,
                currency: pi.currency,
                status: pi.status,
                paymentDate: new Date(pi.created * 1000),
            });
        }
    }

    for (const invoice of invoices.data) {
        if (invoice.status === "paid") {
            payments.push({
                id: invoice.id,
                description: invoice.description || "Subscription payment",
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: invoice.status,
                paymentDate: invoice.status_transitions.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000)
                    : new Date(invoice.created * 1000),
            });
        }
    }

    return payments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
}

export default async function GymSettingsMembershipPage({ params }: Props) {
    const { slug } = await params;
    const { membership } = await requireAdminGymMembership(slug);

    const [plans, studentMemberships, studentData, subscription] = await Promise.all([
        getMembershipPlansByGym(membership.gymId),
        getStudentMembershipsByGym(membership.gymId),
        getGymStudentsBySlug(membership.gymId),
        getSubscriptionByGymId(membership.gymId),
    ]);

    const payments = subscription?.stripeCustomerId
        ? await getStripePayments(subscription.stripeCustomerId)
        : [];

    const students = (studentData ?? []).map((s) => ({
        id: s.profile.userId,
        name: s.profile.name,
    }));

    const studentPlanMap = new Map<string, string>();
    studentMemberships.forEach((sm) => {
        if (sm.membershipPlanId) studentPlanMap.set(sm.studentId, sm.membershipPlanId);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Membership billing
                    </h1>
                    <p className="text-muted-foreground">
                        Manage plans, assignments, and see your gym payments.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <PlanForm slug={slug} defaultCurrency={membership.gym?.defaultCurrency ?? "usd"} />
                <StudentMembershipForm
                    slug={slug}
                    students={students}
                    plans={plans.map((p) => ({ id: p.id, name: p.name }))}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Plans</CardTitle>
                    <CardDescription>Billing cycles and limits for your gym.</CardDescription>
                </CardHeader>
                <CardContent>
                    {plans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No plans yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Billing</TableHead>
                                        <TableHead>Attendance</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-medium">{plan.name}</TableCell>
                                            <TableCell>{formatAmount(plan.price, plan.currency)}</TableCell>
                                            <TableCell className="capitalize">{plan.billingCycle}</TableCell>
                                            <TableCell className="capitalize">
                                                {plan.attendanceLimitType === "unlimited"
                                                    ? "Unlimited"
                                                    : `${plan.attendanceLimit ?? 0} / ${plan.attendanceLimitType}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={plan.isActive ? "outline" : "destructive"}>
                                                    {plan.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student assignments</CardTitle>
                    <CardDescription>Which students belong to which plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No students yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Plan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => {
                                        const planId = studentPlanMap.get(student.id);
                                        const planName = plans.find((p) => p.id === planId)?.name ?? "Not assigned";
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell className={planId ? "" : "text-muted-foreground"}>
                                                    {planName}
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
