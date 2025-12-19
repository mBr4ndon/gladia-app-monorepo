"use client";

import { manualCheckInAction, revokeAttendanceAction } from "@/actions/attendance";
import { cancelClassAction, finishClassAction, updateClassTimeAction } from "@/actions/class-actions";
import { QRCodeDisplay } from "@/components/qr-code-display";
import type { ClassWithAttendances, GymStudents, MembershipRow } from "@gladia-app/db/queries";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@gladia-app/ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@gladia-app/ui/components/avatar";
import { Badge } from "@gladia-app/ui/components/badge";
import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@gladia-app/ui/components/dialog";
import { Input } from "@gladia-app/ui/components/input";
import { Label } from "@gladia-app/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gladia-app/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gladia-app/ui/components/table";
import { ArrowLeft, Calendar, CheckCircle, Clock, Pencil, QrCode, Trash2, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const getModalityColor = (modality: string) => {
    switch (modality) {
        case 'gi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'nogi': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'fundamentals': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'open_mat': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

const formatTime = (time: string) => {
    // Ensure time is in HH:MM format
    const [hours, minutes] = time.split(':');
    return `${hours!.padStart(2, '0')}:${minutes!.padStart(2, '0')}`;
};

const getModalityText = (modality: string) => {
    switch (modality) {
        case 'gi': return "Gi";
        case 'nogi': return "No-gi";
        case 'kids': return "Kids";
        case 'open_mat': return "Open-mat";
        default: return modality.replace('_', ' ').toUpperCase();
    }
};

type Props = {
    slug: string;
    cls: ClassWithAttendances;
    role: MembershipRow["role"];
    students: GymStudents[];
    userId: string;
}

export function ClassDetailsPage({ slug, cls, students, userId, role }: Props) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");
    const [showQRCode, setShowQRCode] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const t = useTranslations("classDetails");
    const locale = useLocale();
    const formatDate = useCallback(
        (date: string) =>
            new Date(date).toLocaleDateString(locale, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
        [locale],
    );

    const openEditDialog = () => {
        setEditStartTime(cls.class.startAt);
        setEditEndTime(cls.class.endAt);
        setIsEditDialogOpen(true);
    };

    const handleEditClass = () => {
        if (!editStartTime || !editEndTime) {
            return;
        }

        startTransition(async () => {
            await updateClassTimeAction(
                cls.class.id,
                editStartTime,
                editEndTime,
                slug,
            );
            setIsEditDialogOpen(false);
            router.refresh();
        });
    }

    const handleFinishClass = () => {
        startTransition(async () => {
            await finishClassAction(cls.class.id, slug);
            router.refresh();
        });
    };

    const handleCancelClass = () => {
        startTransition(async () => {
            await cancelClassAction(cls.class.id, slug);
            router.refresh();
        });
    };

    const handleManualCheckIn = () => {
        if (!selectedStudentId) {
            return;
        }

        startTransition(async () => {
            await manualCheckInAction(cls.class.id, selectedStudentId, userId, slug);
            setSelectedStudentId("");
            router.refresh();
        });
    }

    const handleDeleteAttendance = (attendanceId: string) => {
        startTransition(async () => {
            await revokeAttendanceAction(attendanceId, cls.class.id, slug);
            router.refresh();
        });
    };

    const availableStudents = students.filter(student => 
        !cls.attendances.some(att => att.userId === student.profile.userId)
    );
    
    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/gym/${slug}/classes`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t("backFull")}</span>
                        <span className="sm:hidden">{t("backShort")}</span>
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5"/>
                                <h2 className="text-xl">{t("classDetails")}</h2>
                            </CardTitle>

                            <div className="flex flex-wrap gap-2">
                                {
                                    cls.class.status === "active" ? (
                                            role === "admin" && (
                                                <>
                                                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={openEditDialog} className="flex-1 sm:flex-initial">
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">{t("editTime")}</span>
                                                                <span className="sm:hidden">{t("edit")}</span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>{t("editDialogTitle")}</DialogTitle>
                                                                <DialogDescription>
                                                                    {t("editDialogDescription")}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="start-time">{t("startTime")}</Label>
                                                                    <Input
                                                                        id="start-time"
                                                                        type="time"
                                                                        value={editStartTime}
                                                                        onChange={(e) => setEditStartTime(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="end-time">{t("endTime")}</Label>
                                                                    <Input
                                                                    id="end-time"
                                                                    type="time"
                                                                    value={editEndTime}
                                                                    onChange={(e) => setEditEndTime(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                                                    {t("cancel")}
                                                                </Button>
                                                                <Button onClick={handleEditClass}>
                                                                    {t("save")}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
        
                                                    {
                                                        cls.class.qrToken && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => setShowQRCode(!showQRCode)}
                                                                className="flex-1 sm:flex-initial"
                                                            >
                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">{showQRCode ? t("hideQr") : t("showQr")}</span>
                                                                <span className="sm:hidden">QR</span>
                                                            </Button>
                                                        )
                                                    }
        
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="default" size="sm" className="flex-1 sm:flex-initial">
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">{t("finish")}</span>
                                                                <span className="sm:hidden">{t("finishShort")}</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t("finishConfirmTitle")}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t("finishConfirmDescription")}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleFinishClass}>
                                                                    {t("finishConfirmAction")}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
        
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="flex-1 sm:flex-initial">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span className="hidden sm:inline">{t("cancelClass")}</span>
                                                                <span className="sm:hidden">{t("cancelClassShort")}</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t("cancelConfirmDescription")}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t("keepClass")}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleCancelClass} className="bg-destructive hover:bg-destructive/90">
                                                                    {t("cancelConfirmAction")}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )
                                    ) : (
                                    <Badge variant="secondary" className="px-3 py-1">
                                            {cls.class.status === 'finished' ? t("statusFinished") : t("statusCanceled")}
                                        </Badge>
                                    )
                                }
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="text-xl font-semibold">{cls.class.title}</h3>
                                <p className="text-muted-foreground">{formatDate(cls.class.date)}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge variant="secondary" className={getModalityColor(cls.class.modality)}>
                                        {getModalityText(cls.class.modality)}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(cls.class.startAt)} - {formatTime(cls.class.endAt)}
                                    </div>
                                </div>
                            </div>

                            <div>
                                {
                                    cls.class.coachName && (
                                        <div>
                                            <p className="text-sm font-medium">{t("coach")} </p>
                                            <p className="text-muted-foreground">{cls.class.coachName}</p>
                                        </div>
                                    )
                                }

                                <div className="mt-2">
                                    <p className="text-sm font-medium">{t("capacity")}</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{cls.attendances.length}/{cls.class.capacity || '∞'}</span>
                                        {cls.class.capacity && cls.attendances.length >= cls.class.capacity && (
                                            <Badge variant="destructive">{t("full")}</Badge>
                                        )}
                                    </div>
                                </div>                            
                            </div>                            
                        </div>
                    </CardContent>
                </Card>

                {
                    showQRCode && cls.class.status === "active" && cls.class.qrToken && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("qrCardTitle")}</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <QRCodeDisplay 
                                    qrToken={cls.class.qrToken}
                                    classTitle={cls.class.title}
                                    classDate={cls.class.date}
                                    startTime={cls.class.startAt}
                                    endTime={cls.class.endAt}
                                    capacity={cls.class.capacity}
                                    attendanceCount={cls.attendances.length}
                                />

                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">{t("qrInstructionsTitle")}</h4>
                                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                        {t.raw("qrSteps").map((step: string) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                    </ol>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {t("qrNote")}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                }

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t("attendanceTitle", { count: cls.attendances.length })}
                            </CardTitle>

                            {
                                cls.class.status === "active" && role === "admin" && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                                <SelectTrigger className="w-full sm:w-[200px]">
                                                    <SelectValue placeholder={
                                                        availableStudents.length === 0 
                                                            ? (cls.attendances.length === 0 
                                                                ? t("noStudentsAvailable")
                                                                : t("allCheckedIn")
                                                            )
                                                            : t("selectStudentPlaceholder")
                                                        } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStudents.map((student) => (
                                                    <SelectItem key={student.profile.userId} value={student.profile.userId}>
                                                        <div className="flex items-center gap-2">
                                                            {student.profile?.belt && (
                                                                // <BeltBadge belt={student.profile.belt} />
                                                                <span>{student.profile.belt}</span>
                                                            )}
                                                            <span>{student.profile?.name || 'Unknown Student'}</span>
                                                        </div>
                                                    </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button 
                                                onClick={handleManualCheckIn}
                                                disabled={!selectedStudentId || availableStudents.length === 0}
                                                size="sm"
                                            >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                                {t("addManually")}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </CardHeader>

                    <CardContent>
                        {
                            cls.attendances.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">{t("noAttendanceTitle")}</h3>
                                    <p className="text-muted-foreground">
                                        {t("noAttendanceDescription")}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto -mx-6 sm:mx-0">
                                    <div className="inline-block min-w-full align-middle">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>Belt</TableHead>
                                                    { role === "admin" && <TableHead>Actions</TableHead> }
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {
                                                    cls.attendances.map(a => (
                                                        <TableRow key={a.id}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={students.find(s => s.profile.userId === a.userId)!.profile!.avatarUrl!} />
                                                                        <AvatarFallback>
                                                                            {students.find(s => s.profile.userId === a.userId)?.profile.name.charAt(0).toUpperCase() || "?"}
                                                                        </AvatarFallback>
                                                                    </Avatar>

                                                                    <span className="font-medium">
                                                                        { students.find(s => s.profile.userId === a.userId)?.profile.name }
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell>
                                                                <span>{ students.find(s => s.profile.userId === a.userId)?.profile.belt }</span>
                                                            </TableCell>
                                                            {
                                                                role === "admin" && (
                                                                    <TableCell>
                                                                        {
                                                                            cls.class.status === "active" ? (
                                                                                <AlertDialog>
                                                                                    <AlertDialogTrigger asChild>
                                                                                        <Button variant="ghost" size="sm">
                                                                                            <X className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </AlertDialogTrigger>
                                                                                    <AlertDialogContent>
                                                                                        <AlertDialogHeader>
                                                                                            <AlertDialogTitle>{t("removeAttendanceTitle")}</AlertDialogTitle>
                                                                                            <AlertDialogDescription>
                                                                                                {t("removeAttendanceDescription")}
                                                                                            </AlertDialogDescription>
                                                                                        </AlertDialogHeader>

                                                                                        <AlertDialogFooter>
                                                                                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                                                            <AlertDialogAction 
                                                                                                onClick={() => handleDeleteAttendance(a.id)}
                                                                                                className="bg-destructive hover:bg-destructive/90"
                                                                                            >
                                                                                                {t("revoke")}
                                                                                            </AlertDialogAction>

                                                                                        </AlertDialogFooter>
                                                                                    </AlertDialogContent>                                                                            
                                                                                </AlertDialog>
                                                                            ) : (
                                                                                <span className="text-muted-foreground text-sm">Finished</span>
                                                                            )
                                                                        }
                                                                    </TableCell>
                                                                )
                                                            }

                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
