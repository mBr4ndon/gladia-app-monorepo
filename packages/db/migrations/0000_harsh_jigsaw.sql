CREATE TYPE "public"."achievement_category" AS ENUM('attendance', 'milestone', 'special');--> statement-breakpoint
CREATE TYPE "public"."attendance_limit_type" AS ENUM('unlimited', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."attendance_source" AS ENUM('qr_code', 'manual');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."class_modality" AS ENUM('gi', 'no_gi', 'kids', 'open_mat');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('active', 'finished', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('usd', 'eur', 'gbp', 'brl');--> statement-breakpoint
CREATE TYPE "public"."gym_status" AS ENUM('trialing', 'active', 'inactive', 'suspended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'pt', 'es');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"gym_id" text NOT NULL,
	"type" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "achievement_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"category" "achievement_category" NOT NULL,
	"requirement" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"source" "attendance_source" NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"checked_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "belt_promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"gym_id" uuid NOT NULL,
	"previous_belt" text,
	"new_belt" text NOT NULL,
	"promoted_by" uuid NOT NULL,
	"promoted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "belt_promotion_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"belt" text NOT NULL,
	"required_classes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"start_at" time NOT NULL,
	"end_at" time NOT NULL,
	"modality" "class_modality" NOT NULL,
	"capacity" integer,
	"coach_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "class_status" DEFAULT 'active' NOT NULL,
	"qr_token" text
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "gym_status" DEFAULT 'active' NOT NULL,
	"stripe_connected_account_id" text,
	"default_currency" "currency" DEFAULT 'eur' NOT NULL,
	"invite_token" text NOT NULL,
	"invite_enabled" boolean DEFAULT true NOT NULL,
	"invite_token_updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"gym_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_membership_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" "currency" DEFAULT 'eur' NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"payment_method" text NOT NULL,
	"status" text NOT NULL,
	"stripe_payment_intent_id" text,
	"notes" text,
	"recorded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"attendance_limit_type" "attendance_limit_type" DEFAULT 'unlimited' NOT NULL,
	"attendance_limit" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"gym_id" uuid,
	"subscription_id" uuid,
	"stripe_payment_intent_id" text,
	"stripe_invoice_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text NOT NULL,
	"description" text,
	"receipt_url" text,
	"invoice_pdf_url" text,
	"payment_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"birthdate" date,
	"belt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"avatar_url" text,
	"phone" text,
	"language" "language" DEFAULT 'en' NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "student_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"gym_id" uuid NOT NULL,
	"membership_plan_id" uuid,
	"status" text NOT NULL,
	"payment_method" text NOT NULL,
	"stripe_subscription_id" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_billing_date" date,
	"custom_price" integer,
	"custom_attendance_limit" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stripe_customer_id" text
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"gym_id" uuid,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text NOT NULL,
	"plan_name" text,
	"amount" integer,
	"currency" text DEFAULT 'usd',
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_checked_by_user_id_profiles_user_id_fk" FOREIGN KEY ("checked_by_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "belt_promotions" ADD CONSTRAINT "belt_promotions_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "belt_promotions" ADD CONSTRAINT "belt_promotions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "belt_promotion_rules" ADD CONSTRAINT "belt_promotion_rules_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_payments" ADD CONSTRAINT "membership_payments_student_membership_id_student_memberships_id_fk" FOREIGN KEY ("student_membership_id") REFERENCES "public"."student_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_memberships" ADD CONSTRAINT "student_memberships_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_memberships" ADD CONSTRAINT "student_memberships_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_gym_achievement" ON "achievements" USING btree ("user_id","gym_id","type");--> statement-breakpoint
CREATE INDEX "idx_achievements_user_id" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_achievements_gym_id" ON "achievements" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "idx_achievements_type" ON "achievements" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_class_id_user_id_key" ON "attendances" USING btree ("class_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_attendance_class_user" ON "attendances" USING btree ("class_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_belt_promotions_user_gym" ON "belt_promotions" USING btree ("user_id","gym_id");--> statement-breakpoint
CREATE INDEX "idx_belt_promotions_promoted_at" ON "belt_promotions" USING btree ("promoted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "belt_promotion_rules_gym_id_belt_key" ON "belt_promotion_rules" USING btree ("gym_id","belt");--> statement-breakpoint
CREATE UNIQUE INDEX "classes_qr_token_key" ON "classes" USING btree ("qr_token");--> statement-breakpoint
CREATE INDEX "idx_classes_gym_date" ON "classes" USING btree ("gym_id","date");--> statement-breakpoint
CREATE INDEX "idx_classes_status" ON "classes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_classes_qr_token" ON "classes" USING btree ("qr_token");--> statement-breakpoint
CREATE UNIQUE INDEX "gyms_slug_key" ON "gyms" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "gyms_invite_token_key" ON "gyms" USING btree ("invite_token");--> statement-breakpoint
CREATE INDEX "idx_gyms_stripe_connected_account_id" ON "gyms" USING btree ("stripe_connected_account_id");--> statement-breakpoint
CREATE INDEX "idx_gyms_status" ON "gyms" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_user_id_gym_id_key" ON "memberships" USING btree ("user_id","gym_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_user_gym" ON "memberships" USING btree ("user_id","gym_id");--> statement-breakpoint
CREATE INDEX "idx_memberships_gym_role" ON "memberships" USING btree ("gym_id","role");--> statement-breakpoint
CREATE INDEX "idx_membership_payments_student_membership_id" ON "membership_payments" USING btree ("student_membership_id");--> statement-breakpoint
CREATE INDEX "idx_membership_plans_gym_id" ON "membership_plans" USING btree ("gym_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_subscription_id" ON "payments" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_payments_payment_date" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_student_gym_membership" ON "student_memberships" USING btree ("student_id","gym_id");--> statement-breakpoint
CREATE INDEX "idx_student_memberships_stripe_customer_id" ON "student_memberships" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_student_memberships_stripe_subscription_id" ON "student_memberships" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_student_memberships_student_id" ON "student_memberships" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_memberships_gym_id" ON "student_memberships" USING btree ("gym_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_gym_id" ON "subscriptions" USING btree ("gym_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions" USING btree ("stripe_customer_id");