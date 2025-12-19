"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@gladia-app/ui/components/avatar";
import { Badge } from "@gladia-app/ui/components/badge";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent } from "@gladia-app/ui/components/card";
import { cn } from "@gladia-app/ui/lib/utils";
import { Award, BarChart3, Calendar, Crown, Medal, TrendingUp, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type TimeFrame = "week" | "month" | "all";

type RankedEntry = {
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    classesAttended: number;
    rank: number;
};

type LeaderboardPageProps = {
    gymName: string;
    leaderboard: Record<TimeFrame, RankedEntry[]>;
};

const rankStyles = {
    1: {
        cardClass:
            "border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 via-background to-amber-100",
        badgeClass: "bg-amber-400 text-amber-950",
        iconColor: "text-amber-500",
        Icon: Crown,
    },
    2: {
        cardClass:
            "border-slate-200 shadow-md bg-gradient-to-br from-slate-50 via-background to-slate-100",
        badgeClass: "bg-slate-200 text-slate-900",
        iconColor: "text-slate-500",
        Icon: Medal,
    },
    3: {
        cardClass:
            "border-orange-200 shadow-md bg-gradient-to-br from-orange-50 via-background to-orange-100",
        badgeClass: "bg-orange-200 text-orange-900",
        iconColor: "text-orange-500",
        Icon: Award,
    },
} as const;

export function LeaderboardPage({ gymName, leaderboard }: LeaderboardPageProps) {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
    const t = useTranslations("leaderboard");

    const entries = useMemo(() => leaderboard[timeFrame] ?? [], [leaderboard, timeFrame]);

    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <div className="text-center space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {t("badge")}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {t("title", { timeFrame: t(`timeframes.${timeFrame}`).toLowerCase() })}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle", { gymName })}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button
                    variant={timeFrame === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFrame("week")}
                    className="gap-2"
                >
                    <Calendar className="h-4 w-4" />
                    {t("timeframes.week")}
                </Button>
                <Button
                    variant={timeFrame === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFrame("month")}
                    className="gap-2"
                >
                    <BarChart3 className="h-4 w-4" />
                    {t("timeframes.month")}
                </Button>
                <Button
                    variant={timeFrame === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFrame("all")}
                    className="gap-2"
                >
                    <TrendingUp className="h-4 w-4" />
                    {t("timeframes.all")}
                </Button>
            </div>

            <div className="grid gap-3 sm:gap-4 max-w-4xl mx-auto">
                {entries.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center space-y-3">
                            <Trophy className="h-10 w-10 text-muted-foreground mx-auto" />
                            <div className="space-y-1">
                                <p className="text-base font-semibold">{t("emptyTitle")}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t("emptyDescription")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    entries.map((entry) => {
                        const style = rankStyles[entry.rank as 1 | 2 | 3];
                        const Icon = style?.Icon ?? Trophy;

                        return (
                            <Card
                                key={entry.userId}
                                className={cn(
                                    "relative overflow-hidden border transition-all duration-200 hover:translate-y-[-2px]",
                                    style?.cardClass,
                                )}
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Icon
                                                    className={cn(
                                                        "h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground",
                                                        style?.iconColor,
                                                    )}
                                                />
                                                <Badge
                                                    variant="secondary"
                                                    className={cn("text-sm", style?.badgeClass)}
                                                >
                                                    #{entry.rank}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.name ?? ""} />
                                                    <AvatarFallback>
                                                        {entry.name?.slice(0, 2).toUpperCase() ?? "?"}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0">
                                                    <h3 className="text-lg sm:text-xl font-semibold truncate">
                                                        {entry.name ?? "Student"}
                                                    </h3>
                                                    {entry.rank <= 3 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {t(`ranks.${entry.rank as 1 | 2 | 3}`)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xl sm:text-2xl font-bold">
                                                {entry.classesAttended}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                {t("classesAttended", { count: entry.classesAttended })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
