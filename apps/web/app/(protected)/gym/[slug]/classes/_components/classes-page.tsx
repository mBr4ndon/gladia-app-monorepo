"use client";

import { qrCodeCheckInAction } from "@/actions/attendance";
import { CalendarWeekView } from "@/components/calendar-week-view";
import { ClassCard } from "@/components/class-card";
import { QRScanner } from "@/components/qr-scanner";
import { Class, MembershipRow } from "@gladia-app/db/queries";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { toast, Toaster } from "@gladia-app/ui/components/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gladia-app/ui/components/tabs";
import { Calendar, CalendarDays, List, Plus, QrCode } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type Props = {
    slug: string;
    role: MembershipRow["role"];
    userId: string;
    classes: Class[];
};

export default function ClassesPage({ slug, classes, userId, role }: Props) {
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [showScanner, setShowScanner] = useState(false);
    const [isProcessingScan, setIsProcessingScan] = useState(false);
    const t = useTranslations("classesPage");
    const locale = useLocale();

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        return `${hours!.padStart(2, "0")}:${minutes!.padStart(2, "0")}`;
    };

    const getModalityColor = (modality: string) => {
        switch (modality) {
            case "gi":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "nogi":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "kids":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "open_mat":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const handleQrCodeCheckIn = async (id: string) => {
        if (isProcessingScan) return;

        setIsProcessingScan(true);
        setShowScanner(false);

        try {
            const result = await qrCodeCheckInAction(id, userId);

            switch (result.status) {
                case "error": {
                    toast.error(result.message);
                    break;
                }
                case "warning": {
                    toast.warning(result.message);
                    break;
                }
                case "success": {
                    toast.success(result.message);
                    break;
                }
                default: {
                    toast(result.message);
                    break;
                }
            }
        } catch (error: any) {
            const msg = error?.message || "Unexpected error during check-in";
            toast.error(msg);
        } finally {
            setIsProcessingScan(false);
        }
    };

    const upcomingClasses = classes.filter((c) => c.status === "active");
    const finishedClasses = classes.filter((c) => c.status === "finished");

    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <Toaster />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>

                <div className="flex gap-2">
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === "calendar" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                        >
                            <CalendarDays className="h-4 w-4" />
                            <span className="sr-only">{t("calendarView")}</span>
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                            <span className="sr-only">{t("listView")}</span>
                        </Button>
                    </div>

                    {role === "admin" && (
                        <Button asChild size="sm">
                            <Link href={`/gym/${slug}/classes/new`}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">{t("createClass")}</span>
                                <span className="sm:hidden">{t("createClass")}</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {role === "student" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            {t("checkInTitle")}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="text-center space-y-4">
                            {!showScanner ? (
                                <>
                                    <p className="text-muted-foreground">
                                        {t("checkInDescription")}
                                    </p>
                                    <Button onClick={() => setShowScanner(true)}>
                                        <QrCode className="h-4 w-4 mr-2" />
                                        {t("openScanner")}
                                    </Button>
                                </>
                            ) : (
                                <QRScanner onScanSuccess={handleQrCodeCheckIn} onCloseScanner={() => setShowScanner(false)} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {viewMode === "calendar" ? (
                <Card>
                    <CardContent className="p-6">
                        <CalendarWeekView
                            classes={upcomingClasses as any[]}
                            onClassClick={() => {}}
                            formatTime={formatTime}
                            getModalityColor={getModalityColor}
                            language={locale}
                        />
                    </CardContent>
                </Card>
            ) : role === "admin" ? (
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">{t("upcoming")}</TabsTrigger>
                        <TabsTrigger value="finished">{t("finished")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("upcomingTitle")}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                {upcomingClasses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">{t("noUpcomingTitle")}</h3>
                                        <p className="text-muted-foreground">
                                            {t("noUpcomingDescription")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {upcomingClasses.map((cls) => (
                                            <ClassCard
                                                key={cls.id}
                                                cls={cls}
                                                slug={slug}
                                                role={role}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="finished" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("finishedTitle")}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                {finishedClasses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">{t("noFinishedTitle")}</h3>
                                        <p className="text-muted-foreground">
                                            {t("noFinishedDescription")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {finishedClasses.map((cls) => (
                                            <ClassCard
                                                key={cls.id}
                                                cls={cls}
                                                slug={slug}
                                                role={role}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("upcomingTitle")}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">{t("noUpcomingTitle")}</h3>
                                <p className="text-muted-foreground">
                                    {t("noUpcomingDescription")}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {upcomingClasses.map((cls) => (
                                    <ClassCard
                                        key={cls.id}
                                        cls={cls}
                                        slug={slug}
                                        role={role}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
