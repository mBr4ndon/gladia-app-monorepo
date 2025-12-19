import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@gladia-app/auth/server";

type Props = Readonly<{
    children: ReactNode;
}>;

export default async function PublicLayout({ children }: Props) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session && session.user) {
        redirect("/onboarding-page");
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                {children}
            </div>
        </div>
    )
}