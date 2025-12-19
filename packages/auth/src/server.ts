import { betterAuth } from "better-auth";
import { toNextJsHandler as handler } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authDb as db } from "@gladia-app/db/auth-db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    pages: {
        signIn: "/sign-in",
    },
    trustedOrigins: process.env.NODE_ENV === "production" ? [process.env.APP1_URL, process.env.APP2_URL].filter((url): url is string  =>  Boolean(url)) : ["http://localhost:3000", "http://localhost:3001"],
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    }
});

export const toNextJsHandler = handler;
export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];

process.env.NEON_AUTH_DB_URL;