"use client";


import { useGymSetupForm } from "@/hooks/use-gym-setup-form";
import { Badge } from "@gladia-app/ui/components/badge";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Input } from "@gladia-app/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { useTranslations } from "next-intl";

export default function NewGymPage() {
  const t = useTranslations("gymNew");

  const {
    register,
    handleSubmit,
    formState,
    timezones,
    planType,
    selectTimezone,
    selectPlanType,
    handleGymCreation,
  } = useGymSetupForm(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <main className="container mx-auto py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-4">
              {t("step")}
            </Badge>
            <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("detailsTitle")}</CardTitle>
              <CardDescription>{t("detailsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(handleGymCreation)}>
                {/* Gym Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("fields.name")}</label>
                  <Input type="text" {...register("name")} placeholder={t("fields.namePlaceholder")} />
                  {formState.errors.name && (
                    <p className="mt-1 text-sm text-destructive">{formState.errors.name.message}</p>
                  )}
                </div>

                {/* Gym URL */}
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("fields.url")}</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-input border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                      {t("fields.urlPrefix")}
                    </span>
                    <Input
                      type="text"
                      {...register("slug")}
                      placeholder="your-gym-name"
                      className="rounded-l-none"
                    />
                  </div>
                  {formState.errors.slug && (
                    <p className="mt-1 text-sm text-destructive">{formState.errors.slug.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("fields.urlHint")}
                  </p>
                </div>

                {/* Timezone */}
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("fields.timezone")}</label>
                  <Select onValueChange={selectTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.timezonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formState.errors.timezone && (
                    <p className="mt-1 text-sm text-destructive">{formState.errors.timezone.message}</p>
                  )}
                </div>

                {/* Subscription Plan */}
                <div>
                  <label className="mb-3 block text-sm font-medium">{t("fields.plan")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Monthly */}
                    <div
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        planType === "monthly"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => selectPlanType("monthly")}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{t("plans.monthly")}</div>
                        <div className="text-2xl font-bold text-primary">{t("plans.monthlyPrice")}</div>
                        <div className="text-xs text-muted-foreground">{t("plans.monthlyUnit")}</div>
                      </div>
                    </div>

                    {/* Annual */}
                    <div
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        planType === "annual"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => selectPlanType("annual")}
                    >
                      <div className="text-center">
                        <div className="font-semibold">{t("plans.annual")}</div>
                        <div className="text-2xl font-bold text-primary">{t("plans.annualPrice")}</div>
                        <div className="text-xs text-muted-foreground">{t("plans.annualUnit")}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{t("plans.annualNote")}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t("plans.annualBadge")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {formState.errors.planType && (
                    <p className="mt-1 text-sm text-destructive">{formState.errors.planType.message}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{t("plans.trialNote")}</p>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={formState.isSubmitting} size="lg">
                    {formState.isSubmitting ? t("actions.submitting") : t("actions.submit")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
