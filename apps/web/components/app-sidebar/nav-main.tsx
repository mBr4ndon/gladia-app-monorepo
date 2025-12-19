"use client"

import { Calendar, ChevronRight, LayoutDashboard, Medal, Settings2, Trophy, Users } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@gladia-app/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@gladia-app/ui/components/sidebar";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ProfileWithMemberships } from "@gladia-app/db/queries";
import { useTranslations } from "next-intl";

const data = (slug: string, t: (key: string) => string) => [
  {
    title: t("nav.dashboard"),
    url: `/gym/${slug}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    title: t("nav.classes"),
    url: `/gym/${slug}/classes`,
    icon: Calendar,
  },
  {
    title: t("nav.students"),
    url: `/gym/${slug}/students`,
    icon: Users,
    role: "admin",
  },
  {
    title: t("nav.leaderboard"),
    url: `/gym/${slug}/leaderboard`,
    icon: Trophy,
  },
  {
    title: t("nav.achievements"),
    url: `/gym/${slug}/achievements`,
    icon: Medal,
    role: "student",
  },
  {
    title: t("nav.settings"),
    url: `/gym/${slug}/settings`,
    icon: Settings2,
    role: "admin",
    items: [
      {
        title: t("nav.general"),
        url: `/gym/${slug}/settings/general`,
      },
      {
        title: t("nav.billing"),
        url: `/gym/${slug}/settings/billing`,
      },
      {
        title: t("nav.membership"),
        url: `/gym/${slug}/settings/membership`,
      },
      {
        title: t("nav.training"),
        url: `/gym/${slug}/settings/training`,
      },
      {
        title: t("nav.advanced"),
        url: `/gym/${slug}/settings/advanced`,
      }
    ]
  }
];

type Props = Readonly<{
  user: ProfileWithMemberships;
}>;

export function NavMain({ user }: Props) {
  const params = useParams<{ slug: string; }>();
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const items = data(params.slug, t).map(i => ({
    ...i,
    isActive: pathname.startsWith(i.url),
  }));

  const membershipRole = user.memberships.find(m => m.gym?.slug === params.slug)?.role;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform {params.slug} </SidebarGroupLabel>
      <SidebarMenu>
        {items.filter(i => !i.role || i.role === membershipRole).map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
