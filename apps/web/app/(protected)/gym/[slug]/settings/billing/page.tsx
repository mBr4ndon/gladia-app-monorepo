import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gladia-app/ui/components/table";
import { Badge } from "@gladia-app/ui/components/badge";
import { getSubscriptionByGymId } from "@gladia-app/db/queries";
import { MembershipActions } from "./_components/membership-actions";
import Stripe from "stripe";
import { requireAdminGymMembership } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{
    params: Promise<{ slug: string }>;
}>;

const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(price / 100);

const stripeClient = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" })
    : null;

type StripePayment = {
    id: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    paymentDate: Date;
};

async function getStripePaymentsForGym(gymId: string) {
    if (!stripeClient) {
        return { payments: [], error: "Stripe not configured." };
    }

    const subscription = await getSubscriptionByGymId(gymId);

    if (!subscription?.stripeCustomerId) {
        return { payments: [], error: "No Stripe customer found for this gym." };
    }

    const [paymentIntents, invoices] = await Promise.all([
        stripeClient.paymentIntents.list({ customer: subscription.stripeCustomerId, limit: 50 }),
        stripeClient.invoices.list({ customer: subscription.stripeCustomerId, limit: 50 }),
    ]);

    const payments: StripePayment[] = [];

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

    payments.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());

    return { payments, error: null as string | null };
}

export default async function GymSettingsMembershipPage({ params }: Props) {
    const { slug } = await params;
    const { membership } = await requireAdminGymMembership(slug);
    const t = await getTranslations("settingsBilling");

    const { payments, error } = await getStripePaymentsForGym(membership.gymId);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
                <MembershipActions slug={slug} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("paymentsTitle")}</CardTitle>
                    <CardDescription>{t("paymentsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <p className="text-sm text-destructive">{error === "Stripe not configured." ? t("noStripe") : t("noCustomer")}</p>
                    ) : payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("noPayments")}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("date")}</TableHead>
                                        <TableHead>{t("description")}</TableHead>
                                        <TableHead>{t("status")}</TableHead>
                                        <TableHead className="text-right">{t("amount")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.paymentDate
                                                    ? new Date(payment.paymentDate).toLocaleDateString()
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {payment.description ?? t("defaultDescription")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {payment.status ?? t("unknown")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatPrice(payment.amount, payment.currency)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
