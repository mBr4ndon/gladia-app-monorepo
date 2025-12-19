import type { Class, MembershipRow } from "@gladia-app/db/queries";
import { Badge } from "@gladia-app/ui/components/badge";
import { Button } from "@gladia-app/ui/components/button";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const getModalityText = (modality: string) => {
    switch (modality) {
        case 'gi': return "Gi";
        case 'nogi': return "No-Gi";
        case 'kids': return "Kids";
        case 'open_mat': return "Open Mat";
        default: return modality.replace('_', ' ').toUpperCase();
    }
};

const getModalityColor = (modality: string) => {
    switch (modality) {
        case 'gi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'nogi': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'kids': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'open_mat': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

const formatDate = (date: string, locale: string) => {
    return new Date(date).toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
};

const formatTime = (time: string) => {
    // Ensure time is in HH:MM format
    const [hours, minutes] = time.split(':');
    return `${hours!.padStart(2, '0')}:${minutes!.padStart(2, '0')}`;
  };

type Props = {
    slug: string;
    cls: Class;
    role: MembershipRow["role"];
}

export function ClassCard({ slug, cls, role }: Props) {
    const t = useTranslations("classCard");
    const locale = useLocale();
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-md border p-4 hover:bg-accent/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 w-full">
                <div className="flex flex-col items-start sm:items-center text-sm flex-shrink-0">
                    <div className="font-semibold">{formatDate(cls.date, locale)}</div>

                    <div className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(cls.startAt)} - {formatTime(cls.endAt)}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{cls.title}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getModalityColor(cls.modality)}>
                            {getModalityText(cls.modality)}
                        </Badge>
                        {
                            cls.status !== "active" && (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    {t("finished")}
                                </Badge>
                            )
                        }
                        {
                            cls.coachName && (
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                    {t("coach")} {cls.coachName}
                                </span>
                            )
                        }
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-shrink-0">
                    {
                        cls.capacity && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                0/{cls.capacity}
                                {0 >= cls.capacity && (
                                    <Badge variant="destructive" className="ml-2">{t("full")}</Badge>
                                )}
                            </div>
                        )
                    }

                    {
                        role === "admin" && (
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto">
                                    <Link href={`/gym/${slug}/classes/${cls.id}`}>
                                        {t("manage")}
                                    </Link>
                                </Button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
