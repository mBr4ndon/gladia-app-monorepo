"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@gladia-app/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@gladia-app/ui/components/card";
import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldDescription,
} from "@gladia-app/ui/components/field";
import { Input } from "@gladia-app/ui/components/input";

import { createAuthClient } from "@gladia-app/auth/client";
import { signInSchema, type SignInData } from "@gladia-app/validation";
import { ZodError } from "zod";
import { useTranslations } from "next-intl";

export default function SignInPage() {
    const { signIn } = createAuthClient();
    const t = useTranslations("signIn");

    const [formData, setFormData] = useState<SignInData>({
        email: "",
        password: "",
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsLoading(true);

        try {
            const validatedData = signInSchema.parse(formData);

            const { error: signInError } = await signIn.email({
                email: validatedData.email,
                password: validatedData.password,
                callbackURL: "/onboarding-page",
            });

            if (signInError) {
                setError(signInError.message ?? t("invalidCredentials"));
                return;
            }

            router.push("/onboarding-page");
        } catch (err) {
            if (err instanceof ZodError) {
                const fieldErrors: Record<string, string> = {};

                err.issues.forEach((issue) => {
                    const path = issue.path[0] as string;
                    fieldErrors[path] = issue.message;
                });

                setFieldErrors(fieldErrors);
            } else {
                console.error(err);
                setError(t("unexpectedError"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-md w-full">
            <Card>
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription>
                        {t("description")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            {error && (
                                <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Field>
                                <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />

                                {fieldErrors.email && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        {t("forgotPassword")}
                                    </a>
                                </div>

                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                {fieldErrors.password && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </Field>

                            <Field className="space-y-3">
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? t("submitting") : t("submit")}
                                </Button>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                    disabled={isLoading}
                                    onClick={() =>
                                        signIn.social({
                                            provider: "google",
                                            callbackURL: "/onboarding-page",
                                        })
                                    }
                                >
                                    {t("google")}
                                </Button>

                                <FieldDescription className="text-center">
                                    {t("noAccount")}{" "}
                                    <a
                                        href="/sign-up"
                                        className="underline underline-offset-4"
                                    >{t("signUp")}</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
