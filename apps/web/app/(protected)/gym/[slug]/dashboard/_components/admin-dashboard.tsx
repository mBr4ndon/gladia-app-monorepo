import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Calendar, Plus, Users, Users2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type Props = Readonly<{
    gymName: string;
    slug: string;
    stats: {
        todaysClasses: number;
        todaysAttendance: number;
    };
    todaysClasses: {
        id: string;
        title: string;
        date: Date;
        startAt: Date;
        endAt: Date;
    }[];
}>;

export function AdminDashboard({
    gymName,
    slug,
    stats,
    todaysClasses,
}: Props) {
    const t = useTranslations("adminDashboard");
    const hasClassesToday = todaysClasses.length > 0;

    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {gymName} 
                    </h1>
                    <p className="text-muted-foreground">
                        {t("welcome")}
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild size="sm" className="md:size-default">
                        <Link href={`/gym/${slug}/classes/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("actions.createClass")}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        size="sm"
                        className="md:size-default"
                    >
                        <Link href={`/gym/${slug}/students`}>
                            <Users className="mr-2 h-4 w-4" />
                            {t("actions.manageStudents")}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("stats.todaysClasses")}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.todaysClasses}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("stats.activeClasses")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("stats.totalAttendance")}
                        </CardTitle>
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.todaysAttendance}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("stats.studentsToday")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("classes.title")}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                    {!hasClassesToday && (
                        <p className="text-sm text-muted-foreground">
                            {t("classes.empty")}
                        </p>
                    )}

                    {hasClassesToday && (
                        <ul className="space-y-2">
                            {todaysClasses.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {c.title}
                                        </span>
                                        {/* Se quiseres, podes formatar a hora aqui */}
                                        {/* <span className="text-xs text-muted-foreground">
                                            {formatTime(c.startAt)} - {formatTime(c.endAt)}
                                        </span> */}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );    
}
