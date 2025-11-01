// app/events/[id]/builder/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicFormBuilder from '@/components/form/DynamicFormBuilder';

const FormBuilderPage = () => {
  const params = useParams();
  const router = useRouter();
  
  // Extract eventId from params
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);

  const handleSuccess = () => {
    alert('Form structure saved successfully!');
    // Redirect the organizer back to the event details page
    router.push(`/events/${eventId}`); 
  };
  
  if (!eventId) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-500">Error: Event ID is missing.</p>
        </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Build Registration Form for Event: {eventId}</h1>
        <DynamicFormBuilder eventId={eventId} onSaveSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default FormBuilderPage;