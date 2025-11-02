// src/app/event-page/event-details/page.tsx

// 🛑 DO NOT put "use client" here. This must remain a Server Component.
import { Suspense } from 'react';
import EventDetailsClientContent from './EventDetailsClient'; 

export default function EventDetailsPage() {
    return (
        <Suspense fallback={
            // ... your loading UI (uses Tailwind CSS)
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4" />
                <p className="text-xl">Initializing Event Page...</p>
            </div>
        }>
            <EventDetailsClientContent />
        </Suspense>
    );
}