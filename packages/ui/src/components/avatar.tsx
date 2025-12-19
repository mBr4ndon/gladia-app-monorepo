"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@gladia-app/ui/lib/utils";

type AvatarStatus = "idle" | "loading" | "loaded" | "error";

const AvatarContext = React.createContext<{
    status: AvatarStatus;
    setStatus: (status: AvatarStatus) => void;
} | null>(null);

const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, children, ...props }, ref) => {
    const [status, setStatus] = React.useState<AvatarStatus>("idle");

    return (
        <AvatarContext.Provider value={{ status, setStatus }}>
            <AvatarPrimitive.Root
                ref={ref}
                data-slot="avatar"
                className={cn(
                    "relative flex size-8 shrink-0 overflow-hidden rounded-full",
                    className,
                )}
                {...props}
            >
                {children}
            </AvatarPrimitive.Root>
        </AvatarContext.Provider>
    );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, onLoadingStatusChange, src, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext);

    React.useEffect(() => {
        if (!ctx) return;
        if (!src) ctx.setStatus("error");
        else ctx.setStatus("loading");
    }, [ctx, src]);

    return (
        <AvatarPrimitive.Image
            ref={ref}
            data-slot="avatar-image"
            className={cn("aspect-square size-full", className)}
            loading="lazy"
            src={src}
            onLoadingStatusChange={(status) => {
                if (ctx) {
                    ctx.setStatus(status as AvatarStatus);
                }
                onLoadingStatusChange?.(status);
            }}
            {...props}
        />
    );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, delayMs = 0, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext);
    const hidden = ctx?.status === "loaded";

    return (
        <AvatarPrimitive.Fallback
            ref={ref}
            data-slot="avatar-fallback"
            className={cn(
                "bg-muted flex size-full items-center justify-center rounded-full",
                hidden && "hidden",
                className,
            )}
            delayMs={delayMs}
            suppressHydrationWarning
            {...props}
        />
    );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
