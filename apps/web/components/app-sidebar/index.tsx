"use client"

import { ProfileWithMemberships } from "@gladia-app/db/queries";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@gladia-app/ui/components/sidebar";
import * as React from "react";
import { GymSwitcher } from "./gym-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

type Props = Readonly<{
    user: ProfileWithMemberships;
    sidebarProps?: React.ComponentProps<typeof Sidebar>;
}>;

export function AppSidebar({ user, ...props }: Props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <GymSwitcher gyms={user.memberships} />
      </SidebarHeader>
      <SidebarContent>
        { (user.memberships && user.memberships.length > 0) ? <NavMain user={user} /> : null }
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2">
          <LanguageSwitcher currentLanguage={user.profile.language} />
          <NavUser user={user.profile} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
