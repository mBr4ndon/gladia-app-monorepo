import { auth } from "@gladia-app/auth/server";
import { getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { Badge } from "@gladia-app/ui/components/badge";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Building, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function OnboardingPage() {
    const t = await getTranslations("onboarding");
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = await getProfileWithMembershipsById(session!.user.id);

    if (user?.memberships && user.memberships.length > 0) {
        const firstGymSlug = user!.memberships[0]!.gym!.slug;
        redirect(`/gym/${firstGymSlug}/dashboard`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
            <main className="container mx-auto py-6 sm:py-8 md:py-12 lg:py-16 px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("title")}</h1>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto">
                        {/* Admin Signup Card */}
                        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10 w-fit">
                                        <Building className="h-8 w-8 text-accent" />
                                    </div>
                                    <Badge variant="secondary" className="mb-2 w-fit mx-auto">{t("owner.badge")}</Badge>
                                    <CardTitle className="text-xl sm:text-2xl">{t("owner.title")}</CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        {t("owner.description")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                    {t.raw("owner.bullets").map((item: string) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                    </div>
                                        <Button 
                                            className="w-full" 
                                            size="lg"
                                        >
                                            <Link href="/gym/new" className="gap">
                                            {t("owner.cta")}
                                            </Link>
                                        </Button>
                                </CardContent>
                            </Card>

                        {/* Student Info Card */}
                        <Card className="relative overflow-hidden border-2 border-muted/50">
                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-4 p-3 rounded-full bg-muted/20 w-fit">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <Badge variant="outline" className="mb-2 w-fit mx-auto">{t("student.badge")}</Badge>
                                    <CardTitle className="text-xl sm:text-2xl">{t("student.title")}</CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                    {t("student.description")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                    {t.raw("student.bullets").map((item: string) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {t("student.hint")}
                                    </p>
                                    </div>
                                </CardContent>
                            </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
