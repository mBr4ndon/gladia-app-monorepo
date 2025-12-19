import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react";
import { Button } from "@gladia-app/ui/components/button";
import { cn } from "@gladia-app/ui/lib/utils";
import { Badge } from "@gladia-app/ui/components/badge";

interface ClassEvent {
    id: string;
    title: string;
    date: string;
    startAt: string;
    endAt: string;
    modality: string;
    status: string;
    coachName?: string;
    capacity?: number;
    attendance?: any[];
}

interface CalendarWeekViewProps {
    classes: ClassEvent[];
    onClassClick: (classId: string) => void;
    getModalityColor: (modality: string) => string;
    formatTime: (time: string) => string;
    language?: string;
}

export function CalendarWeekView({
    classes,
    onClassClick,
    getModalityColor,
    formatTime,
    language = "en",
}: CalendarWeekViewProps) {
    const locale = language || "en";
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        return monday;
    });

  // Generate time slots from 6 AM to 10 PM
    const timeSlots = Array.from({ length: 17 }, (_, i) => {
        const hour = i + 6;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

  // Get days of current week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);
        return day;
    });

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        setCurrentWeekStart(monday);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getClassesForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return classes.filter(cls => cls.date === dateStr);
    };

    const getClassPosition = (startTime: string, endTime: string) => {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = (startHour! - 6) * 60 + startMin!;
        const endMinutes = (endHour! - 6) * 60 + endMin!;
        const duration = endMinutes - startMinutes;

        // Each hour is 80px, so each minute is 80/60 = 1.33px
        const top = (startMinutes / 60) * 80;
        const height = (duration / 60) * 80;

        return { top, height };
    };

    const formatWeekRange = () => {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const start = currentWeekStart.toLocaleDateString(locale, options);
        const end = weekEnd.toLocaleDateString(locale, options);

        return `${start} - ${end}`;
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                <Calendar className="h-4 w-4 mr-2" />
                Today
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <h2 className="text-lg font-semibold">{formatWeekRange()}</h2>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden bg-background">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-2 text-xs font-medium text-muted-foreground border-r">Time</div>
                {weekDays.map((day, i) => (
                <div
                    key={i}
                    className={cn(
                    "p-2 text-center border-r last:border-r-0",
                    isToday(day) && "bg-primary/10"
                    )}
                >
                    <div className="text-xs font-medium text-muted-foreground">
                        {day.toLocaleDateString(locale, { weekday: 'short' })}
                    </div>
                    <div
                    className={cn(
                        "text-lg font-semibold",
                        isToday(day) && "text-primary"
                    )}
                    >
                        {day.getDate()}
                    </div>
                </div>
                ))}
            </div>

            {/* Time Slots and Classes */}
            <div className="grid grid-cols-8 relative">
                {/* Time Column */}
                <div className="border-r">
                {timeSlots.map((time, i) => (
                    <div
                    key={i}
                    className="h-20 border-b text-xs text-muted-foreground p-1 text-right pr-2"
                    >
                    {time}
                    </div>
                ))}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                const dayClasses = getClassesForDay(day);
                
                return (
                    <div key={dayIndex} className="relative border-r last:border-r-0">
                    {/* Hour Grid Lines */}
                    {timeSlots.map((_, i) => (
                        <div key={i} className="h-20 border-b" />
                    ))}

                    {/* Classes */}
                    <div className="absolute inset-0 pointer-events-none">
                        {dayClasses.map((cls) => {
                        const { top, height } = getClassPosition(cls.startAt, cls.endAt);
                        const attendanceCount = cls.attendance?.length || 0;
                        const isFull = cls.capacity && attendanceCount >= cls.capacity;
                        
                        return (
                            <div
                            key={cls.id}
                            className={cn(
                                "absolute left-0.5 right-0.5 rounded-md p-1.5 overflow-hidden",
                                "cursor-pointer pointer-events-auto transition-all hover:shadow-md hover:scale-[1.02]",
                                "border-l-4",
                                getModalityColor(cls.modality),
                                cls.status !== 'active' && "opacity-60"
                            )}
                            style={{ top: `${top}px`, height: `${height}px`, minHeight: '60px' }}
                            onClick={() => onClassClick(cls.id)}
                            >
                            <div className="text-xs font-semibold truncate">
                                {cls.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {formatTime(cls.startAt)} - {formatTime(cls.endAt)}
                            </div>
                            {cls.coachName && (
                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {cls.coachName}
                                </div>
                            )}
                            {cls.capacity && (
                                <div className="flex items-center gap-1 text-xs mt-0.5">
                                <Users className="h-3 w-3" />
                                <span className={cn(isFull && "text-destructive font-medium")}>
                                    {attendanceCount}/{cls.capacity}
                                </span>
                                </div>
                            )}
                            {cls.status !== 'active' && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 mt-1">
                                Finished
                                </Badge>
                            )}
                            </div>
                        );
                        })}
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        </div>
    );
}
