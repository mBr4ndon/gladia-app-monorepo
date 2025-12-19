import { z } from "zod";

const identity = (key: string) => key;

export const signInSchema = z.object({
    email: z.string().email("signIn.invalidEmail"),
    password: z.string().min(6, "signIn.passwordTooShort"),
});

export const signUpSchema = z.object({
    name: z.string().min(2, "signUp.nameTooShort"),
    email: z.string().email("signUp.invalidEmail"),
    password: z.string().min(6, "signUp.passwordTooShort"),
    confirmPassword: z.string().min(6, "signUp.confirmPasswordTooShort"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "signUp.passwordsDoNotMatch",
    path: ["confirmPassword"],
});

export const createSetupGymSchema = (t: (key: string) => string = identity) =>
    z.object({
        name: z.string().min(3, t("form.gymNameMin")).max(100, t("form.gymNameMax")),
        slug: z
            .string()
            .min(3, t("form.slugMin"))
            .max(50, t("form.slugMax"))
            .regex(
                /^[a-z0-9-]+$/,
                t("form.slugRegex"),
            ),
        timezone: z.string().min(1, t("form.timezoneMandatory")),
        planType: z.enum(["monthly", "annual"]),
    });

export const setupGymSchema = createSetupGymSchema();

export const createCreateClassesSchema = (t: (key: string) => string = identity) =>
    z.object({
        title: z.string().min(1, t("titleRequired")),
        startDate: z.date({ required_error: t("startDateRequired") }),
        endDate: z.date({ required_error: t("endDateRequired") }),
        startAt: z.string().min(1, t("startTimeRequired")), // "HH:mm"
        endAt: z.string().min(1, t("endTimeRequired")),     // "HH:mm"
        modality: z.enum(["gi", "nogi", "kids", "open_mat"], {
            required_error: t("modalityRequired"),
            invalid_type_error: t("modalityRequired"),
        }),
        capacity: z.string().optional(),
        coachName: z.string().optional(),
        selectedDays: z.array(z.number()).min(1, t("selectAtLeastOneDay")),
    });

export const createClassesSchema = createCreateClassesSchema();

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type SetupGymData = z.infer<typeof setupGymSchema>;
export type CreateClassesData = z.infer<typeof createClassesSchema>;
