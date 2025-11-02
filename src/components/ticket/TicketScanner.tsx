// Path: src/components/TicketScanner.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Loader2, AlertTriangle, CheckCircle, Ticket } from 'lucide-react';

interface TicketScannerProps {
    eventId: string; // The ID of the event currently being checked-in for
}

const qrcodeRegionId = "html5qrcode-container";

const TicketScanner: React.FC<TicketScannerProps> = ({ eventId }) => {
    const [checkStatus, setCheckStatus] = useState<'idle' | 'scanning' | 'checking' | 'valid' | 'invalid'>('scanning');
    const [message, setMessage] = useState('Initializing scanner. Please allow camera access.');
    const [qrCodeScanner, setQrCodeScanner] = useState<Html5Qrcode | null>(null);

    // --- 1. Scanning and Verification Logic ---
    const handleScan = useCallback(async (decodedText: string) => {
        if (checkStatus === 'checking') return;

        setCheckStatus('checking');
        setMessage(`Processing ticket: ${decodedText.substring(0, 8)}...`);

        // Stop the scanner immediately to prevent re-triggering while processing
        if (qrCodeScanner && qrCodeScanner.isScanning) {
             await qrCodeScanner.pause(); 
        }

        try {
            // Call the secure API route
            const response = await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketUid: decodedText, eventId }),
            });

            const data = await response.json();

            if (data.success) {
                setCheckStatus('valid');
                setMessage(`✅ ${data.message}`);
            } else {
                setCheckStatus('invalid');
                setMessage(`❌ ${data.message}`);
            }

        } catch (err) {
            setCheckStatus('invalid');
            setMessage('Network error or server connection failed.');
        } finally {
            // Reset state and restart scanning after a short delay
            setTimeout(() => {
                setMessage('Ready for next scan.');
                setCheckStatus('scanning');
                if (qrCodeScanner) {
                    qrCodeScanner.resume();
                }
            }, 3500); 
        }
    }, [checkStatus, eventId, qrCodeScanner]);


    // --- 2. Camera Initialization and Cleanup ---
    useEffect(() => {
        // Initialize the scanner
        const scanner = new Html5Qrcode(qrcodeRegionId, {
            verbose: false, 
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        });
        setQrCodeScanner(scanner);

        // Configuration for the scanner
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            // Prefer the back camera ('environment')
            facingMode: "environment" as "user" | "environment" | undefined, 
        };

        const startScanning = async () => {
            try {
                // Request camera permission and start scanning
                await scanner.start(
                    { facingMode: config.facingMode },
                    config,
                    handleScan, // Success handler
                    (errorMessage) => { 
                        // Error/Scanning progress handler (can be noisy, so often kept empty) 
                    } 
                );
                setMessage('Scanning for QR code...');
                setCheckStatus('scanning');
            } catch (err) {
                console.error("Camera start failed:", err);
                setMessage('❌ Error: Could not start camera. Check permissions.');
                setCheckStatus('invalid');
            }
        };

        startScanning();

        // Cleanup function: stop the scanner when the component unmounts
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().catch(console.error);
            }
        };
    // Dependency array includes handleScan to ensure the latest callback is used
    }, [handleScan]); 

    // --- 3. Render ---
    return (
        <div className="p-4 md:p-8 max-w-xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center text-gray-800">
                <Ticket className="w-8 h-8 mr-2 text-indigo-600" /> Event Check-In Tool
            </h1>

            {/* QR READER AREA - The div ID must match the ID used in Html5Qrcode constructor */}
            <div 
                id={qrcodeRegionId} 
                className="border-4 border-indigo-600 rounded-lg overflow-hidden mb-6 shadow-xl w-full"
            >
                {(checkStatus === 'checking' || checkStatus === 'invalid') && (
                    <div className="text-center p-10 bg-gray-200">
                        {checkStatus === 'checking' ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
                        )}
                        <p className="mt-2 text-gray-700">Processing...</p>
                    </div>
                )}
            </div>
            
            {/* STATUS BAR - Provides instant visual feedback */}
            <div className={`p-4 rounded-lg text-center font-semibold transition-colors duration-300 ${
                checkStatus === 'valid' ? 'bg-green-100 text-green-800 border-green-300' :
                checkStatus === 'invalid' ? 'bg-red-100 text-red-800 border-red-300' :
                checkStatus === 'checking' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-gray-100 text-gray-700 border-gray-300'
            } border`}>
                {checkStatus === 'valid' && <CheckCircle className="w-6 h-6 mx-auto mb-2" />}
                <p>{message}</p>
            </div>

            <div className='mt-4 text-center text-sm text-gray-500'>
                Scanning for Event ID: **{eventId.substring(0, 8)}...**
            </div>
        </div>
    );
};

export default TicketScanner;