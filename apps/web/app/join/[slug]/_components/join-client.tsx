"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LogIn, UserPlus, School } from "lucide-react";

import { Button } from "@gladia-app/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@gladia-app/ui/components/card";
import { joinAcademyAction } from "@/actions/join-gym";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { BJJ_BELTS } from "@/lib/belts";
import { BeltBadge } from "@/components/belt-badge";

type Props = {
    isAuthenticated: boolean;
    gymName: string;
    slug: string;
    invite: string;
    callbackURL: string;
    hasBelt: boolean;
};

export function JoinPageClient({
    isAuthenticated,
    gymName,
    slug,
    invite,
    callbackURL,
    hasBelt,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [belt, setBelt] = useState<string | undefined>(undefined);
    const [beltError, setBeltError] = useState<string | null>(null);

    const handleJoin = () => {
        setBeltError(null);

        // se o user não tem belt no profile, obrigamos a escolher um
        if (!hasBelt && !belt) {
            setBeltError("Please select your current belt.");
            return;
        }

        startTransition(() => joinAcademyAction(slug, invite, belt));
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-xl space-y-8">
                {/* Header */}
                <div className="space-y-3 text-center">
                    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Invite to academy
                    </span>

                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                            Join{" "}
                            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {gymName}
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground text-balance">
                            You&apos;ve been invited to join this academy on Gladia.
                            Once you join, your progress and attendance will be tracked here.
                        </p>
                    </div>
                </div>

                {/* Not authenticated: sign in / sign up choices */}
                {!isAuthenticated ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="space-y-1 pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted">
                                        <LogIn className="h-4 w-4" />
                                    </span>
                                    I already have an account
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground text-balance">
                                    Log in to your existing Gladia account and we&apos;ll connect
                                    you to this academy automatically.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button
                                    asChild
                                    className="w-full"
                                >
                                    <Link
                                        href={`/sign-in?callbackURL=${encodeURIComponent(
                                            callbackURL,
                                        )}`}
                                    >
                                        Continue to sign in
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col">
                            <CardHeader className="space-y-1 pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted">
                                        <UserPlus className="h-4 w-4" />
                                    </span>
                                    I&apos;m new to Gladia
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground text-balance">
                                    Create a new Gladia account first, then join this academy
                                    in one smooth flow.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button
                                    asChild
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Link
                                        href={`/sign-up?callbackURL=${encodeURIComponent(
                                            callbackURL,
                                        )}`}
                                    >
                                        Create an account
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Authenticated: confirm join (+ belt if needed)
                    <Card>
                        <CardHeader className="space-y-2">
                            <CardTitle className="flex items-center gap-2">
                                <span className="inline-flex size-9 items-center justify-center rounded-full bg-muted">
                                    <School className="h-5 w-5" />
                                </span>
                                Join this academy
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground text-balance">
                                You&apos;re currently logged in. Confirm to join{" "}
                                <span className="font-medium">{gymName}</span> as a student.
                                You can switch between academies later from your sidebar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!hasBelt && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            Your current belt
                                        </p>
                                        <span className="text-[11px] text-muted-foreground">
                                            Required to join
                                        </span>
                                    </div>
                                    <Select
                                        value={belt}
                                        onValueChange={(value) => {
                                            setBelt(value);
                                            setBeltError(null);
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                beltError
                                                    ? "border-destructive"
                                                    : undefined
                                            }
                                        >
                                            <SelectValue placeholder="Select your belt" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BJJ_BELTS.map((b) => (
                                                <SelectItem
                                                    key={b.value}
                                                    value={b.value}
                                                >
                                                    <BeltBadge belt={b.value} />
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {beltError && (
                                        <p className="text-xs text-destructive">
                                            {beltError}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground">
                                        This helps your academy staff quickly understand your
                                        current level and place you in the right classes.
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleJoin}
                                disabled={isPending}
                                className="w-full"
                            >
                                {isPending ? "Joining academy..." : "Join academy"}
                            </Button>
                            <p className="text-[11px] leading-relaxed text-muted-foreground text-center text-balance">
                                By joining, your profile and training data will be visible to the
                                staff of this academy. You can leave the academy at any time in
                                your account settings.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Small footer text */}
                <p className="text-[11px] text-center text-muted-foreground text-balance">
                    If you didn&apos;t expect this invite, you can safely ignore this page.
                    You won&apos;t be added to the academy unless you confirm.
                </p>
            </div>
        </div>
    );
}
