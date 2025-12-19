"use client";

import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

import { Button } from "@gladia-app/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gladia-app/ui/components/card";
import { Camera, CameraOff, CheckCircle, X } from "lucide-react";

interface SimpleQRScannerProps {
    onScanSuccess?: (data: string) => void | Promise<void>;
    onScanError?: (error: string) => void;
    onCloseScanner?: () => void;
}

export function QRScanner({ onScanSuccess, onScanError, onCloseScanner }: SimpleQRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [scanCount, setScanCount] = useState(0);

    const isProcessingRef = useRef(false);

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const startScanning = async () => {
        if (!videoRef.current) {
            return;
        }

        try {

            isProcessingRef.current = false;

            scannerRef.current = new QrScanner(
                videoRef.current,
                async (result) => {
                    if (isProcessingRef.current) {
                        return;
                    }

                    isProcessingRef.current = true;

                    setScanCount((prev) => {
                        const next = prev + 1;
                        return next;
                    });

                    try {
                        stopScanning();

                        await onScanSuccess?.(result.data);
                    } catch (err: any) {
                        const msg = err?.message || "Failed to process QR result";
                        onScanError?.(msg);
                    }
                },
                {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                },
            );

            await scannerRef.current.start();
            setIsScanning(true);

            const monitorInterval = setInterval(() => {
                if (!scannerRef.current || !videoRef.current) return;
                const video = videoRef.current;
            }, 3000);

            setTimeout(() => clearInterval(monitorInterval), 60000);
        } catch (error: any) {
            const msg = error?.message || "Scanner error";
            console.error("QR Scanner error:", error);
            onScanError?.(msg);
        }
    };

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                    {isScanning ? (
                        <>
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            Simple QR Scanner
                        </>
                    ) : (
                        <>
                            <Camera className="h-5 w-5" />
                            Simple QR Scanner
                        </>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                    />

                    {isScanning && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                            🔍 SCANNING ACTIVE
                        </div>
                    )}

                    {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <div className="text-center text-white">
                                <Camera className="h-16 w-16 mx-auto mb-2" />
                                <div className="text-sm">Camera Ready</div>
                            </div>
                        </div>
                    )}

                    {scanCount > 0 && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">
                            ✅ {scanCount}
                        </div>
                    )}
                </div>

                <div className="text-center space-y-3">
                    {!isScanning ? (
                        <Button onClick={startScanning} size="lg" className="w-full" type="button">
                            <Camera className="h-4 w-4 mr-2" />
                            Start QR Scanner
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={stopScanning}
                            size="lg"
                            className="w-full"
                            type="button"
                        >
                            <CameraOff className="h-4 w-4 mr-2" />
                            Stop Scanner
                        </Button>
                    )}

                    <Button variant="destructive" size="lg" className="w-full" type="button" onClick={onCloseScanner}>
                        <X className="h-4 w-4 mr-2" />
                        Close Scanner
                    </Button>

                    <div className="text-xs text-muted-foreground space-y-1">
                        <div>📱 Hold the QR code 15–30 cm from the camera</div>
                        <div>💡 Make sure the area is well lit</div>
                        <div>🎯 Keep the QR code steady and centered</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
