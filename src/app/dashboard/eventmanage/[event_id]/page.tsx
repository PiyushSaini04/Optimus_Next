// src/app/dashboard/eventmanage/[event_id]/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Import the feature components
import EventEditForm from '@/components/dashboard/hostevent/EventEditForm'; 
import EventRegistrationsView from '@/components/dashboard/hostevent/EventRegistrationsView'; 
import EventFormEditor from '@/components/dashboard/hostevent/EventFormBuilder';

// Define the two possible features for modal visibility
type ActiveFeature = 'edit' | 'registrations' | 'form' | null;

const EventManagementPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    
    const eventId = Array.isArray(params.event_id) ? params.event_id[0] : (params.event_id as string | undefined) || 'error-no-id'; 

    const [activeFeature, setActiveFeature] = useState<ActiveFeature>(null);
    
    const displayEventId = eventId.length > 10 ? eventId.substring(0, 8) + '...' : eventId;
    const eventTitle = `Event Management for ID: ${displayEventId}`;

    const handleGoBack = useCallback(() => router.push('/dashboard'), [router]);
    const handleCloseModal = useCallback(() => setActiveFeature(null), []);
    const handleEventUpdated = useCallback(() => setActiveFeature(null), []);

    if (eventId === 'error-no-id') {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                <h1 className="text-3xl text-red-500 mb-4">Event ID Error 🚫</h1>
                <p className="text-gray-400">The Event ID is missing from the URL. Please navigate from your hosted events list.</p>
                <button onClick={handleGoBack} className="mt-6 text-green-400 hover:text-green-500 flex items-center">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                </button>
            </div>
        );
    }

    const overviewContent = (
        <div className="bg-gray-800/90 border border-gray-700 p-8 rounded-xl shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-green-400">{eventTitle}</h1>
                <button onClick={handleGoBack} className="flex items-center text-gray-400 hover:text-green-500 transition duration-200 font-semibold">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to All Hosted Events
                </button>
            </div>

            <p className="text-gray-300 text-lg font-medium mb-6">Select an action to manage your event:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Edit Event Details */}
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:border-orange-400 transition duration-200">
                    <h2 className="text-xl font-semibold text-orange-400 mb-2">✏️ Edit Event Details</h2>
                    <p className="text-gray-400 mb-4 text-sm">Modify title, description, dates, pricing, and banner image.</p>
                    <button onClick={() => setActiveFeature('edit')} className="w-full bg-orange-400 text-gray-900 font-bold py-2 rounded-lg hover:bg-orange-500 transition duration-200 shadow-md">
                        Go to Editor
                    </button>
                </div>

                {/* View Registrations */}
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:border-green-400 transition duration-200">
                    <h2 className="text-xl font-semibold text-green-400 mb-2">👥 View Registrations</h2>
                    <p className="text-gray-400 mb-4 text-sm">Check attendee lists, payment status, and export data.</p>
                    <button onClick={() => setActiveFeature('registrations')} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md">
                        View Registrants
                    </button>
                </div>

                {/* Edit Form Fields */}
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:border-blue-400 transition duration-200">
                    <h2 className="text-xl font-semibold text-blue-400 mb-2">🛠 Edit Registration Form</h2>
                    <p className="text-gray-400 mb-4 text-sm">Modify registration form fields.</p>
                    <button onClick={() => setActiveFeature('form')} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                        Edit Form
                    </button>
                </div>

            </div>
        </div>
    );

    const modalContent = (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-[95vh] overflow-auto">
                
                <button onClick={handleCloseModal} className="absolute top-4 right-4 z-50 p-2 rounded-full text-gray-300 bg-gray-700 hover:bg-gray-600">
                    <X className="w-6 h-6" />
                </button>

                {activeFeature === 'edit' && <EventEditForm eventId={eventId} onCancel={handleCloseModal} onEventUpdated={handleEventUpdated} />}
                {activeFeature === 'registrations' && <EventRegistrationsView eventId={eventId} onBack={handleCloseModal} />}
                {activeFeature === 'form' && <EventFormEditor eventId={eventId} />}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">{overviewContent}</div>
            {activeFeature && modalContent}
        </div>
    );
};

export default EventManagementPage;
