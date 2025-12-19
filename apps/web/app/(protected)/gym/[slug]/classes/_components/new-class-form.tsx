"use client";

import { createRecurringClassesAction } from "@/actions/create-classes";
import { Button } from "@gladia-app/ui/components/button";
import { Calendar } from "@gladia-app/ui/components/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Checkbox } from "@gladia-app/ui/components/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@gladia-app/ui/components/form";
import { Input } from "@gladia-app/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@gladia-app/ui/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { cn } from "@gladia-app/ui/lib/utils";
import { createCreateClassesSchema, type CreateClassesData } from "@gladia-app/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

type Props = {
    slug: string;
    gymId: string;
}

export default function NewClassForm({ slug, gymId }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const t = useTranslations("classes.form");

    const form = useForm<CreateClassesData>({
        resolver: zodResolver(createCreateClassesSchema(t)),
        defaultValues: {
            title: "",
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            startAt: "",
            endAt: "",
            modality: "gi",
            capacity: "",
            coachName: "",
            selectedDays: [],
        },
    });

    const onSubmit = (data: CreateClassesData) => {        
        startTransition(async () => {
            try {
                await createRecurringClassesAction(data as unknown as CreateClassesData, gymId);
                router.push(`/gym/${slug}/classes`);
            } catch (err) {
                console.error(err);
            }
        });
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{t("title")}</CardTitle>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("titleLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("titlePlaceholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="modality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("modalityLabel")}
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={t("modalityPlaceholder")}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="gi">{t("modalityOptions.gi")}</SelectItem>
                                            <SelectItem value="nogi">{t("modalityOptions.nogi")}</SelectItem>
                                            <SelectItem value="kids">{t("modalityOptions.kids")}</SelectItem>
                                            <SelectItem value="open_mat">{t("modalityOptions.open_mat")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        {t("startDateLabel")}
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value &&
                                                                "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                "PPP",
                                                            )
                                                        ) : (
                                                            <span>{t("startDatePlaceholder")}</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date <
                                                        new Date()
                                                    }
                                                    initialFocus
                                                    className="p-3 pointer-events-auto"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        {t("endDateLabel")}
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value &&
                                                                "text-muted-foreground",
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                "PPP",
                                                            )
                                                        ) : (
                                                            <span>{t("endDatePlaceholder")}</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date <
                                                        form.getValues(
                                                            "startDate",
                                                        )
                                                    }
                                                    initialFocus
                                                    className="p-3 pointer-events-auto"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="selectedDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("daysLabel")}
                                    </FormLabel>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {[
                                            {
                                                value: 0,
                                                label: t("days.sunday"),
                                            },
                                            {
                                                value: 1,
                                                label: t("days.monday"),
                                            },
                                            {
                                                value: 2,
                                                label: t("days.tuesday"),
                                            },
                                            {
                                                value: 3,
                                                label: t("days.wednesday"),
                                            },
                                            {
                                                value: 4,
                                                label: t("days.thursday"),
                                            },
                                            {
                                                value: 5,
                                                label: t("days.friday"),
                                            },
                                            {
                                                value: 6,
                                                label: t("days.saturday"),
                                            },
                                        ].map((day) => (
                                            <div
                                                key={day.value}
                                                className="flex flex-col items-center space-y-2"
                                            >
                                                <Checkbox
                                                    checked={field.value?.includes(
                                                        day.value,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        const currentDays =
                                                            field.value || [];
                                                        if (checked) {
                                                            field.onChange([
                                                                ...currentDays,
                                                                day.value,
                                                            ]);
                                                        } else {
                                                            field.onChange(
                                                                currentDays.filter(
                                                                    (d) =>
                                                                        d !==
                                                                        day.value,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs sm:text-sm">
                                                    {day.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("startAtLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("endAtLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>    

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("capacityLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder={t("capacityPlaceholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="coachName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("coachLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("coachPlaceholder")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() =>
                                    router.push(`/gym/${slug}/classes`)
                                }
                            >
                                {t("actions.back")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full sm:w-auto"
                            >
                                {isPending
                                    ? t("actions.submitting")
                                    : t("actions.submit")
                                }
                            </Button>
                        </div>

                    </form>
                </Form>

            </CardContent>
        </Card>
    );
}
