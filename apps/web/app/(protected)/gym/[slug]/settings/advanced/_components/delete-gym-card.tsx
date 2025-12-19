"use client";

import { useTransition } from "react";
import { deleteGymAction } from "@/actions/gym-settings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@gladia-app/ui/components/alert-dialog";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
    slug: string;
    gymName?: string | null;
};

export function DeleteGymCard({ slug, gymName }: Props) {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("settingsAdvanced");

    const handleDelete = () => {
        startTransition(async () => {
            await deleteGymAction(slug);
        });
    };

    return (
        <Card className="border-destructive/30">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t("deleteTitle")}
                    </CardTitle>
                    <CardDescription>
                        {t("deleteDescription")}
                    </CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isPending}>
                            {isPending ? t("deleteConfirm") + "..." : t("deleteButton")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("deleteDialogTitle", { gymName: gymName ?? t("deleteTitle") })}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("deleteDialogDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>{t("deleteCancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={isPending}
                            >
                                {isPending ? t("deleteConfirm") + "..." : t("deleteConfirm")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {t("deleteHelp")}
                </p>
            </CardContent>
        </Card>
    );
}
