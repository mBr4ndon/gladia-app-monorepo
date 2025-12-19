import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Calendar, Trophy, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@gladia-app/ui/components/progress";
import { Badge } from "@gladia-app/ui/components/badge";
import { useTranslations } from "next-intl";
import { BeltBadge } from "@/components/belt-badge";

type LatestAchievement = {
    id: string;
    name: string;
    imageUrl: string | null;
};

type Props = Readonly<{
    slug: string;
    stats: {
        streak: number;
        totalClasses: number;
        achievements: number;
    };
    beltProgress: null | {
        belt?: string | null;
        currentClasses: number;
        requiredClasses: number;
        percent: number;
    };
    latestAchievements: LatestAchievement[];
}>;

export function StudentDashboard({ slug, stats, latestAchievements, beltProgress }: Props) {
    const t = useTranslations("dashboard");

    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="hover-scale hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10">
                                    <Calendar className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-fade-in">
                                        {stats.totalClasses}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t("totalClasses")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover-scale hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200 dark:border-purple-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-purple-500/10">
                                    <Trophy className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 animate-fade-in">
                                        {stats.achievements}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t("achievements")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader className="pb-3 bg-gradient-to-r">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            {t("latestAchievements")}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-3">
                            {latestAchievements.length === 0 && (
                                <p className="text-sm text-muted-foreground">{t("noAchievements")}</p>
                            )}

                            {latestAchievements.map((achievement, index) => (
                                <div
                                    key={achievement.id}
                                    className="animate-fade-in hover-scale group relative"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                    title={achievement.name}
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-2 border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:shadow-lg">
                                        <Image
                                            src={achievement.imageUrl || "/placeholder.svg"}
                                            alt={achievement.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-contain drop-shadow-lg"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="w-full mt-3 hover:bg-yellow-500/10"
                        >
                            <Link href={`/gym/${slug}/achievements`}>
                                {t("viewAllAchievements")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {beltProgress && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                {t("beltProgress")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <BeltBadge belt={beltProgress.belt!}/>
                                <Badge variant="outline">
                                    {beltProgress.currentClasses} / {beltProgress.requiredClasses} {t("classes")}
                                </Badge>
                            </div>
                            <Progress value={beltProgress.percent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {t("beltProgressDetail", {
                                    percent: beltProgress.percent,
                                })}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
