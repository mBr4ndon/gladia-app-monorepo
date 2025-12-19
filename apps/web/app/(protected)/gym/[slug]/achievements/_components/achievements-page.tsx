"use client";

import { AchievementRow, AchievementStats, AchievementTypeRow } from "@gladia-app/db/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@gladia-app/ui/components/avatar";
import { Badge } from "@gladia-app/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Progress } from "@gladia-app/ui/components/progress";
import { Separator } from "@gladia-app/ui/components/separator";
import { cn } from "@gladia-app/ui/lib/utils";
import { Lock, Star, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = Readonly<{
    gymName: string;
    achievementTypes: AchievementTypeRow[];
    userAchievements: AchievementRow[];
    attendanceStats: AchievementStats;
}>;

const categoryColors: Record<string, string> = {
    attendance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    special: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    milestone: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const getAchievementImageSrc = (imageUrl?: string | null) => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) return imageUrl;
};

export function AchievementsPage({
    gymName,
    achievementTypes,
    userAchievements,
    attendanceStats,
}: Props) {
    const t = useTranslations("achievementsPage");

    const earnedIds = new Set(userAchievements.map((a) => a.type));
    const totalAchievements = achievementTypes.length;
    const completion =
        totalAchievements > 0
            ? Math.round(((userAchievements?.length ?? 0) / totalAchievements) * 100)
            : 0;

    return (
        <div className="container mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-4">
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {t("badge")}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                    <Trophy className="h-9 w-9 text-primary" />
                    {t("title", { gymName })}
                </h1>
                <p className="text-muted-foreground text-base">
                    {t("subtitle")}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("earned")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">
                            {userAchievements?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("available")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalAchievements}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t("completion")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{completion}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{t("allTrophies")}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary fill-primary" />
                            <span>{t("earnedLabel")}</span>
                        </div>
                        <Separator orientation="vertical" className="h-5" />
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>{t("lockedLabel")}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {achievementTypes.map((achievement) => {
                        const isEarned = earnedIds.has(achievement.id);
                        const requirement = (achievement.requirement as Record<string, any>) ?? {};
                        const target = requirement.count ?? 1;
                        const current =
                            requirement.type === "streak"
                                ? attendanceStats.currentStreak
                                : attendanceStats.totalClasses;
                        const progressPercent = Math.min((current / target) * 100, 100);
                        const categoryClass = categoryColors[achievement.category] ?? "bg-muted text-foreground border-border";
                        const categoryLabel = t(`categories.${achievement.category}`, { default: achievement.category });

                        return (
                            <Card
                                key={achievement.id}
                                className={cn(
                                    "relative overflow-hidden transition-all hover:shadow-lg",
                                    isEarned ? "border-primary/50 bg-primary/5" : "",
                                )}
                            >
                                {isEarned && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Star className="h-6 w-6 text-primary fill-primary drop-shadow" />
                                    </div>
                                )}

                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                "relative rounded-lg overflow-hidden flex-shrink-0 border bg-muted",
                                                !isEarned && "grayscale opacity-50",
                                            )}
                                        >
                                            {/* <Image src={achievement.imageUrl} alt={achievement.name} width="20" height="20" /> */}
                                            <Avatar className="h-20 w-20 rounded-none">
                                                <AvatarImage
                                                    src={getAchievementImageSrc(achievement.imageUrl)}
                                                    alt={achievement.name}
                                                />
                                                <AvatarFallback className="rounded-none">
                                                    {achievement.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            {!isEarned && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
                                                    <Lock className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                                            <Badge variant="outline" className={cn("mt-1", categoryClass)}>
                                                {categoryLabel}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <CardDescription className="text-sm">
                                        {achievement.description}
                                    </CardDescription>

                                    {!isEarned && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t("progress")}</span>
                                                <span className="font-medium">
                                                    {current} / {target}
                                                </span>
                                            </div>
                                            <Progress value={progressPercent} className="h-2" />
                                        </div>
                                    )}

                                    {isEarned && (
                                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                            <Trophy className="h-4 w-4" />
                                            {t("completed")}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
