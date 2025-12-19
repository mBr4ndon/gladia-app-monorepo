"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@gladia-app/ui/components/button";
import { cancelGymSubscriptionAction } from "@/actions/billing";
import { useTranslations } from "next-intl";

type Props = {
    slug: string;
};

export function MembershipActions({ slug }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("settingsBilling.membershipActions");

    const handleCancel = () => {
        startTransition(async () => {
            await cancelGymSubscriptionAction(slug);
            router.refresh();
        });
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
                {isPending ? t("working") : t("cancel")}
            </Button>
        </div>
    );
}
