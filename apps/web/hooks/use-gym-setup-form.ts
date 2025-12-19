"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSetupGymSchema, setupGymSchema, type SetupGymData } from "@gladia-app/validation";

const TIMEZONES = [
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Denver", label: "America/Denver" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo" },
];

export const getTimezones = () => TIMEZONES;

export function useGymSetupForm(t: any) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SetupGymData>({
    resolver: zodResolver(createSetupGymSchema(t)),
    defaultValues: {
      planType: "monthly",
    },
  });

  const { watch, setValue, handleSubmit, formState, register } = form;

  const gymName = watch("name");
  const planType = watch("planType");

  // Auto-slug com base no nome
  useEffect(() => {
    if (!gymName) return;

    const slug = gymName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);

    setValue("slug", slug, { shouldValidate: true });
  }, [gymName, setValue]);

  const handleGymCreation = useCallback(
    async (data: SetupGymData) => {
      setSubmitError(null);

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message = body?.error ?? "Failed to create checkout session.";
          throw new Error(message);
        }

        const payload = await res.json();
        if (!payload?.url) {
          throw new Error("No checkout URL returned from server.");
        }

        // Redirect para o Stripe Checkout
        window.location.href = payload.url as string;
      } catch (error: any) {
        console.error("Error on gym creation/checkout:", error);
        setSubmitError(error.message || "Something went wrong. Please try again.");
      }
    },
    [],
  );

  const selectTimezone = useCallback(
    (value: string) => {
      setValue("timezone", value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  const selectPlanType = useCallback(
    (type: SetupGymData["planType"]) => {
      setValue("planType", type, { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  const timezones = useMemo(() => getTimezones(), []);

  return {
    register,
    handleSubmit,
    formState,
    gymName,
    planType,
    timezones,
    selectTimezone,
    selectPlanType,
    handleGymCreation,
    submitError,
  };
}
