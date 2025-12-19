"use server";

import { auth } from "@gladia-app/auth/server";
import { updateProfileLanguage } from "@gladia-app/db/queries";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const SUPPORTED_LANGUAGES = ["en", "pt"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function updateLanguagePreference(language: string) {
    if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
        throw new Error("Unsupported language");
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    await updateProfileLanguage(
        session.user.id,
        language as SupportedLanguage,
    );

    revalidatePath("/", "layout");
}
