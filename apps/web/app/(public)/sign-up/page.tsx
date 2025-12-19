"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";

import { createAuthClient } from "@gladia-app/auth/client";
import { Button } from "@gladia-app/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@gladia-app/ui/components/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@gladia-app/ui/components/field";
import { Input } from "@gladia-app/ui/components/input";
import { type SignUpData, signUpSchema } from "@gladia-app/validation";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
    const { signUp } = createAuthClient();
    const router = useRouter();
    const t = useTranslations("signUp");

    const [formData, setFormData] = useState<SignUpData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            // 1) validação com Zod
            const validatedData = signUpSchema.parse(formData);

            // 2) sign up no Better Auth
            const { error: signUpError } = await signUp.email({
                email: validatedData.email,
                password: validatedData.password,
                name: validatedData.name,
                callbackURL: "/sign-in",
            });

            if (signUpError) {
                setError(signUpError.message ?? t("failedCreate"));
                return;
            }

            // 3) sucesso → redirect
            router.push("/sign-in");
        } catch (err) {
            if (err instanceof ZodError) {
                const errors: Record<string, string> = {};

                err.issues.forEach((issue) => {
                    const path = issue.path[0] as string;
                    errors[path] = issue.message;
                });

                setFieldErrors(errors);
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

                            {/* erro global */}
                            {error && (
                                <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Field>
                                <FieldLabel htmlFor="name">{t("nameLabel")}</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder={t("namePlaceholder")}
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                {fieldErrors.name && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </Field>

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
                                <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
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

                            <Field>
                                <FieldLabel htmlFor="confirmPassword">
                                    {t("confirmPasswordLabel")}
                                </FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {fieldErrors.confirmPassword}
                                    </p>
                                )}
                            </Field>

                            <Field className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? t("submitting") : t("submit")}
                                </Button>

                                <FieldDescription className="text-center">
                                    {t("haveAccount")}{" "}
                                    <a
                                        href="/sign-in"
                                        className="underline underline-offset-4"
                                    >
                                        {t("signIn")}
                                    </a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
