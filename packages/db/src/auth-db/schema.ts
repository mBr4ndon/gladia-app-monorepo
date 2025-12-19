import { boolean, pgTable, pgEnum, text, timestamp, date, uniqueIndex, index, jsonb, integer, uuid, time } from "drizzle-orm/pg-core";

// Enums
export const languageEnum = pgEnum("language", ["en", "pt", "es"]);

export const gymStatusEnum = pgEnum("gym_status", [
    "trialing",
    "active",
    "inactive",
    "suspended",
    "cancelled",
]);

export const currencyEnum = pgEnum("currency", ["usd", "eur", "gbp", "brl"]);

export const achievementCategoryEnum = pgEnum("achievement_category", [
    "attendance",
    "milestone",
    "special",
]);

export const attendanceSourceEnum = pgEnum("attendance_source", [
    "qr_code",
    "manual",
]);

export const classModalityEnum = pgEnum("class_modality", [
    "gi",
    "no_gi",
    "kids",
    "open_mat",
]);

export const classStatusEnum = pgEnum("class_status", [
    "active",
    "finished",
    "cancelled",
]);

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "yearly"]);

export const attendanceLimitTypeEnum = pgEnum("attendance_limit_type", [
    "unlimited",
    "fixed",
]);

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);

// Better Auth

export const user = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const account = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domain

export const profile = pgTable(
    "profiles",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .unique()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        birthdate: date("birthdate"),
        belt: text("belt"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        avatarUrl: text("avatar_url"),
        phone: text("phone"),
        language: languageEnum("language").notNull().default("en"),
    },
);

export const gym = pgTable(
    "gyms",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        slug: text("slug").notNull(),
        country: text("country").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        status: gymStatusEnum("status").notNull().default("active"),
        stripeConnectedAccountId: text("stripe_connected_account_id"),
        defaultCurrency: currencyEnum("default_currency")
            .notNull()
            .default("eur"),
        inviteToken: text("invite_token").notNull(),
        inviteEnabled: boolean("invite_enabled").notNull().default(true),
        inviteTokenUpdatedAt: timestamp("invite_token_updated_at", {
            withTimezone: true,
        }),
    },
    (table) => ({
        slugUnique: uniqueIndex("gyms_slug_key").on(table.slug),
        inviteTokenUnique: uniqueIndex("gyms_invite_token_key").on(
            table.inviteToken,
        ),
        stripeConnectedAccountIdx: index(
            "idx_gyms_stripe_connected_account_id",
        ).on(table.stripeConnectedAccountId),
        statusIdx: index("idx_gyms_status").on(table.status),
    }),
);

export const achievementType = pgTable("achievement_types", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url").notNull(),
    category: achievementCategoryEnum("category").notNull(),
    requirement: jsonb("requirement").notNull().default("{}"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const achievement = pgTable(
    "achievements",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id").notNull(),
        gymId: text("gym_id").notNull(),
        type: text("type").notNull(),
        earnedAt: timestamp("earned_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        data: jsonb("data").default("{}"),
    },
    (table) => ({
        uniqueUserGymAchievement: uniqueIndex(
            "unique_user_gym_achievement",
        ).on(table.userId, table.gymId, table.type),
        userIdx: index("idx_achievements_user_id").on(table.userId),
        gymIdx: index("idx_achievements_gym_id").on(table.gymId),
        typeIdx: index("idx_achievements_type").on(table.type),
    }),
);

export const classe = pgTable(
    "classes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        date: date("date").notNull(),
        startAt: time("start_at").notNull(),
        endAt: time("end_at").notNull(),
        modality: classModalityEnum("modality").notNull(),
        capacity: integer("capacity"),
        coachName: text("coach_name"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        status: classStatusEnum("status").notNull().default("active"),
        qrToken: text("qr_token"),
    },
    (table) => ({
        qrTokenUnique: uniqueIndex("classes_qr_token_key").on(table.qrToken),
        gymDateIdx: index("idx_classes_gym_date").on(
            table.gymId,
            table.date,
        ),
        statusIdx: index("idx_classes_status").on(table.status),
        qrTokenIdx: index("idx_classes_qr_token").on(table.qrToken),
    }),
);

export const attendance = pgTable(
    "attendances",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        classId: uuid("class_id")
            .notNull()
            .references(() => classe.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => profile.userId),
        source: attendanceSourceEnum("source").notNull(),
        checkedAt: timestamp("checked_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        checkedByUserId: text("checked_by_user_id").references(
            () => profile.userId,
        ),
    },
    (table) => ({
        classUserUnique: uniqueIndex("attendance_class_id_user_id_key").on(
            table.classId,
            table.userId,
        ),
        classUserIdx: index("idx_attendance_class_user").on(
            table.classId,
            table.userId,
        ),
    }),
);

export const beltPromotionRule = pgTable(
    "belt_promotion_rules",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        belt: text("belt").notNull(),
        requiredClasses: integer("required_classes").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        gymBeltUnique: uniqueIndex(
            "belt_promotion_rules_gym_id_belt_key",
        ).on(table.gymId, table.belt),
    }),
);

export const beltPromotion = pgTable(
    "belt_promotions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => profile.userId, { onDelete: "cascade" }),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        previousBelt: text("previous_belt"),
        newBelt: text("new_belt").notNull(),
        promotedBy: uuid("promoted_by").notNull(),
        promotedAt: timestamp("promoted_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userGymIdx: index("idx_belt_promotions_user_gym").on(
            table.userId,
            table.gymId,
        ),
        promotedAtIdx: index(
            "idx_belt_promotions_promoted_at",
        ).on(table.promotedAt),
    }),
);

export const membershipPlan = pgTable(
    "membership_plans",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        price: integer("price").notNull(),
        currency: text("currency").notNull().default("usd"),
        billingCycle: billingCycleEnum("billing_cycle")
            .notNull()
            .default("monthly"),
        attendanceLimitType: attendanceLimitTypeEnum("attendance_limit_type")
            .notNull()
            .default("unlimited"),
        attendanceLimit: integer("attendance_limit"),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        gymIdx: index("idx_membership_plans_gym_id").on(table.gymId),
    }),
);

export const studentMembership = pgTable(
    "student_memberships",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        studentId: text("student_id").notNull(),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        membershipPlanId: uuid("membership_plan_id").references(
            () => membershipPlan.id,
            { onDelete: "set null" },
        ),
        status: text("status").notNull(),
        paymentMethod: text("payment_method").notNull(),
        stripeSubscriptionId: text("stripe_subscription_id"),
        startDate: date("start_date").notNull(),
        endDate: date("end_date"),
        nextBillingDate: date("next_billing_date"),
        customPrice: integer("custom_price"),
        customAttendanceLimit: integer("custom_attendance_limit"),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        stripeCustomerId: text("stripe_customer_id"),
    },
    (table) => ({
        uniqueStudentGym: uniqueIndex(
            "unique_student_gym_membership",
        ).on(table.studentId, table.gymId),
        stripeCustomerIdx: index(
            "idx_student_memberships_stripe_customer_id",
        ).on(table.stripeCustomerId),
        stripeSubscriptionIdx: index(
            "idx_student_memberships_stripe_subscription_id",
        ).on(table.stripeSubscriptionId),
        studentIdx: index("idx_student_memberships_student_id").on(
            table.studentId,
        ),
        gymIdx: index("idx_student_memberships_gym_id").on(
            table.gymId,
        ),
    }),
);

export const membershipPayment = pgTable(
    "membership_payments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        studentMembershipId: uuid("student_membership_id")
            .notNull()
            .references(() => studentMembership.id, { onDelete: "cascade" }),
        amount: integer("amount").notNull(),
        currency: currencyEnum("currency").notNull().default("eur"),
        paymentDate: timestamp("payment_date", { withTimezone: true })
            .notNull(),
        paymentMethod: text("payment_method").notNull(),
        status: text("status").notNull(),
        stripePaymentIntentId: text("stripe_payment_intent_id"),
        notes: text("notes"),
        recordedBy: text("recorded_by").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        studentMembershipIdx: index(
            "idx_membership_payments_student_membership_id",
        ).on(table.studentMembershipId),
    }),
);

export const membership = pgTable(
    "memberships",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => profile.userId, { onDelete: "cascade" }),
        gymId: uuid("gym_id")
            .notNull()
            .references(() => gym.id, { onDelete: "cascade" }),
        role: userRoleEnum("role").notNull(),
        streak: integer("streak").default(0),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        uniqueUserGym: uniqueIndex(
            "memberships_user_id_gym_id_key",
        ).on(table.userId, table.gymId),
        userGymIdx: index("idx_memberships_user_gym").on(
            table.userId,
            table.gymId,
        ),
        gymRoleIdx: index("idx_memberships_gym_role").on(
            table.gymId,
            table.role,
        ),
    }),
);

export const payment = pgTable(
    "payments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id").references(() => profile.userId, {
            onDelete: "cascade",
        }),
        gymId: uuid("gym_id").references(() => gym.id, {
            onDelete: "cascade",
        }),
        subscriptionId: uuid("subscription_id"),
        stripePaymentIntentId: text("stripe_payment_intent_id"),
        stripeInvoiceId: text("stripe_invoice_id"),
        amount: integer("amount").notNull(),
        currency: text("currency").notNull().default("usd"),
        status: text("status").notNull(),
        description: text("description"),
        receiptUrl: text("receipt_url"),
        invoicePdfUrl: text("invoice_pdf_url"),
        paymentDate: timestamp("payment_date", { withTimezone: true })
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        stripePaymentIntentUnique: uniqueIndex(
            "payments_stripe_payment_intent_id_key",
        ).on(table.stripePaymentIntentId),
        userIdx: index("idx_payments_user_id").on(table.userId),
        subscriptionIdx: index("idx_payments_subscription_id").on(
            table.subscriptionId,
        ),
        paymentDateIdx: index("idx_payments_payment_date").on(
            table.paymentDate,
        ),
    }),
);

export const subscription = pgTable(
    "subscriptions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id").references(() => profile.userId, {
            onDelete: "cascade",
        }),
        gymId: uuid("gym_id").references(() => gym.id, {
            onDelete: "cascade",
        }),
        stripeCustomerId: text("stripe_customer_id"),
        stripeSubscriptionId: text("stripe_subscription_id"),
        status: text("status").notNull(),
        planName: text("plan_name"),
        amount: integer("amount"),
        currency: text("currency").default("usd"),
        currentPeriodStart: timestamp("current_period_start", {
            withTimezone: true,
        }),
        currentPeriodEnd: timestamp("current_period_end", {
            withTimezone: true,
        }),
        trialEnd: timestamp("trial_end", { withTimezone: true }),
        canceledAt: timestamp("canceled_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        stripeSubscriptionUnique: uniqueIndex(
            "subscriptions_stripe_subscription_id_key",
        ).on(table.stripeSubscriptionId),
        userIdx: index("idx_subscriptions_user_id").on(table.userId),
        gymIdx: index("idx_subscriptions_gym_id").on(table.gymId),
        stripeCustomerIdx: index(
            "idx_subscriptions_stripe_customer_id",
        ).on(table.stripeCustomerId),
    }),
);