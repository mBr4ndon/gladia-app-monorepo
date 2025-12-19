"use client";

import { format } from "date-fns";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@gladia-app/ui/components/badge";

interface Props {
    qrToken: string;
    classTitle: string;
    classDate: string;
    startTime: string;
    endTime: string;
    capacity?: number | null;
    attendanceCount: number;
}

export function QRCodeDisplay({
    qrToken,
    classTitle,
    classDate,
    startTime,
    endTime,
    capacity,
    attendanceCount
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
        if (canvasRef.current && qrToken) {
            QRCode.toCanvas(canvasRef.current, qrToken, {
                width: 256,
                margin: 2,
                color: {
                dark: '#000000',
                light: '#FFFFFF'
                }
            }).catch(console.error);
        }
    }, [qrToken]);
  
    const formatTime = (time: string) => {
        // Ensure time is in HH:MM format
        const [hours, minutes] = time.split(':');
        return `${hours!.padStart(2, '0')}:${minutes!.padStart(2, '0')}`;
    };
  
    const getTimeValidityStatus = () => {
        const now = new Date();
        const classDateTime = new Date(`${classDate}T${startTime}`);
        const classEndTime = new Date(`${classDate}T${endTime}`);
        const validFrom = new Date(classDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
        const validUntil = classEndTime; // Until class ends
        
        if (now < validFrom) {
            return { status: 'pending', message: "Pending" };
        } else if (now > validUntil) {
            return { status: 'expired', message: "Expired" };
        } else {
            return { status: 'active', message: "Active" };
        }
    };
  
    const timeStatus = getTimeValidityStatus();

    return (
        <Card className="w-full max-w-md mx-auto">
        <CardHeader>
            <CardTitle className="text-center text-lg">{classTitle}</CardTitle>
            <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
                {format(new Date(classDate), 'MMM dd, yyyy')}
            </span>
            </div>
            <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
                {formatTime(startTime)} - {formatTime(endTime)}
            </span>
            </div>
            <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
                {attendanceCount}{capacity ? ` / ${capacity}` : ''} students
            </span>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-center">
            <canvas 
                ref={canvasRef} 
                className={`border rounded-lg ${timeStatus.status === 'expired' ? 'opacity-50 grayscale' : ''}`}
            />
            </div>
            <div className="text-center">
            <Badge 
                variant={
                timeStatus.status === 'active' ? 'default' : 
                timeStatus.status === 'pending' ? 'secondary' : 
                'destructive'
                }
            >
                {timeStatus.message}
            </Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Students can scan this QR code to check in to the class
            </p>
        </CardContent>
        </Card>
    );
}