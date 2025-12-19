import { createAuthClient as createBetterAuthClient } from "better-auth/react";

export const createAuthClient = () => createBetterAuthClient({
    baseURL: "http://localhost:3000",
});

export type SignIn = ReturnType<typeof createAuthClient>["signIn"];