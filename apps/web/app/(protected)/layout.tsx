import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@gladia-app/auth/server";
import { getProfileWithMembershipsById } from "@gladia-app/db/queries";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@gladia-app/ui/components/sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type Props = Readonly<{
    children: ReactNode;
}>;

export default async function ProtectedLayout({ children }: Props) {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const user = await getProfileWithMembershipsById(session.user.id);

    return (
        <SidebarProvider>
            <AppSidebar user={user!}/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}