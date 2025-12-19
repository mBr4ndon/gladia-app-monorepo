import { createAuthClient as createBetterAuthClient } from "better-auth/react";

export const createAuthClient = () => createBetterAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
});

export type SignIn = ReturnType<typeof createAuthClient>["signIn"];