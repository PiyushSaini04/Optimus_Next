// src/app/event-page/event-details/page.tsx
// This is now a Server Component
// The 'use client' directive has been removed!

import { Suspense } from 'react';
import EventDetailsClientContent from './EventDetailsClient'; // We'll create this file

/**
 * Server Component for the Event Details Page.
 * It's responsible for setting up the Suspense boundary around the Client Component
 * that needs access to useSearchParams().
 */
export default function EventDetailsPage() {
    return (
        // The Suspense boundary prevents the build from failing the static render.
        // The fallback content will be displayed while the client component 
        // that uses useSearchParams() loads on the client side.
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4" />
                <p className="text-xl">Initializing Event Page...</p>
            </div>
        }>
            {/* The client component is rendered inside Suspense */}
            <EventDetailsClientContent />
        </Suspense>
    );
}