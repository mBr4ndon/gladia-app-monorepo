"use client";

import { useEffect, useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { updateLanguagePreference } from "@/actions/profile";
import { ProfileWithMemberships } from "@gladia-app/db/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { SidebarMenu, SidebarMenuItem } from "@gladia-app/ui/components/sidebar";

const LANGUAGE_OPTIONS = ["en", "pt"] as const;
type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

type Props = {
    currentLanguage: ProfileWithMemberships["profile"]["language"];
};

export function LanguageSwitcher({ currentLanguage }: Props) {
    const t = useTranslations("sidebar.languageSwitcher");
    const router = useRouter();
    const initialLanguage = LANGUAGE_OPTIONS.includes(
        currentLanguage as LanguageOption,
    )
        ? (currentLanguage as LanguageOption)
        : "en";
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(initialLanguage);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (LANGUAGE_OPTIONS.includes(currentLanguage as LanguageOption)) {
            setSelectedLanguage(currentLanguage as LanguageOption);
        }
    }, [currentLanguage]);

    const handleLanguageChange = (language: string) => {
        const nextLanguage = (language as LanguageOption) ?? "en";
        const previousLanguage = selectedLanguage;

        setSelectedLanguage(nextLanguage);

        startTransition(async () => {
            try {
                await updateLanguagePreference(nextLanguage);
                router.refresh();
            } catch (error) {
                console.error("Failed to update language preference", error);
                setSelectedLanguage(previousLanguage);
            }
        });
    };

    const options = [
        { value: "en", label: t("options.en") },
        { value: "pt", label: t("options.pt") },
    ] as const;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="space-y-2 rounded-md border border-sidebar-accent/30 bg-sidebar-accent/30 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Languages className="size-4" />
                        <span>{t("label")}</span>
                    </div>
                    <Select
                        value={selectedLanguage}
                        onValueChange={handleLanguageChange}
                        disabled={isPending}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isPending ? (
                        <p className="text-[11px] text-muted-foreground">
                            {t("saving")}
                        </p>
                    ) : null}
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
