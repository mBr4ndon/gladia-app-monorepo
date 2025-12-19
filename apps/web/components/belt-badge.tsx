"use client";

import { Badge } from "@gladia-app/ui/components/badge";
import { cn } from "@gladia-app/ui/lib/utils";
import { getBeltInfo } from "@/lib/belts";
import { useTranslations } from "next-intl";

type BeltBadgeProps = {
    belt: string;
    className?: string;
    showLabel?: boolean;
    label?: string;
};

export const BeltBadge = ({
    belt,
    className,
    showLabel = true,
    label,
}: BeltBadgeProps) => {
    const t = useTranslations("beltBadge.label");
    const beltInfo = getBeltInfo(belt);
    const isGradient = beltInfo.color.includes("linear-gradient");
    const beltLabel = label ?? t(belt as any, { fallback: beltInfo.label });

    return (
        <Badge
            className={cn(
                "font-medium px-3 py-1 text-sm border-2",
                !isGradient && "border-border/20",
                className,
            )}
            style={{
                background: beltInfo.color,
                color: beltInfo.textColor,
                border: isGradient ? "2px solid hsl(var(--border))" : undefined,
            }}
        >
            {showLabel ? `${beltLabel}` : beltLabel}
        </Badge>
    );
};
