"use client";

import { Building, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { ProfileWithMemberships } from "@gladia-app/db/queries";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@gladia-app/ui/components/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@gladia-app/ui/components/sidebar";
import { cn } from "@gladia-app/ui/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
    gyms: ProfileWithMemberships["memberships"];
};

function getSlugFromPath(pathname: string): string | null {
    const parts = pathname.split("/").filter(Boolean);

    const gymIndex = parts.indexOf("gym");
    if (gymIndex === -1) return null;

    const slug = parts[gymIndex + 1];
    return slug ?? null;
}

export function GymSwitcher({ gyms }: Props) {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("sidebar.gymSwitcher");

    const currentSlug = useMemo(
        () => getSlugFromPath(pathname),
        [pathname],
    );

    const [activeGym, setActiveGym] = useState<
        ProfileWithMemberships["memberships"][number] | null
    >(null);

    // definir o activeGym com base no slug da route
    useEffect(() => {
        if (!gyms || gyms.length === 0) {
            setActiveGym(null);
            return;
        }

        if (currentSlug) {
            const matchBySlug = gyms.find(
                (g) => g.gym && g.gym.slug === currentSlug,
            );
            if (matchBySlug) {
                setActiveGym(matchBySlug);
                return;
            }
        }

        setActiveGym(gyms[0] ?? null);
    }, [gyms, currentSlug]);

    if (!activeGym) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <div
                        className={cn(
                            "p-3 rounded-md bg-sidebar-accent/40 text-sidebar-accent-foreground",
                            "text-sm font-medium border border-sidebar-accent/20",
                        )}
                    >
                        {t("empty")}
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const handleSelectGym = (
        gymMembership: ProfileWithMemberships["memberships"][number],
    ) => {
        setActiveGym(gymMembership);

        const slug = gymMembership.gym?.slug;
        if (slug) {
            router.push(`/gym/${slug}/dashboard`);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Building className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {activeGym.gym?.name}
                                </span>
                                <span className="truncate text-xs">
                                    {activeGym.role}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            {t("label")}
                        </DropdownMenuLabel>
                        {gyms.map((gymMembership, index) => (
                            <DropdownMenuItem
                                key={gymMembership.gym?.slug ?? index}
                                onClick={() => handleSelectGym(gymMembership)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <Building className="size-3.5 shrink-0" />
                                </div>
                                {gymMembership.gym?.name}
                                <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
