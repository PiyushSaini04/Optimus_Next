// components/Dashboard/HostedEventsList.tsx
import React from 'react';

interface Event {
    id: string;
    name: string; // event title
    date: string; // Display date
}

interface EventListProps {
    events: Event[];
    title: string;
}

const HostedEventsList: React.FC<EventListProps> = ({ events, title }) => {
    
    // Function to handle the click on the Manage button
    const handleManageClick = (eventId: string) => {
        // In a real application, you'd use Next.js useRouter here:
        // router.push(`/dashboard/events/${eventId}/manage`);
        
        console.log(`Navigating to management page for Event ID: ${eventId}`);
        alert(`Navigating to management page for Event ID: ${eventId}`);
    };

    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 mb-4">{title}</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div 
                            key={event.id} 
                            className="flex space-x-3 items-center justify-between border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                        >
                            {/* Event Details Section (Left) */}
                            <div className="flex space-x-3 items-start flex-1 min-w-0">
                                {/* Color Indicator */}
                                <div className={`w-1 h-10 mt-1 rounded-full bg-green-400 flex-shrink-0`}></div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-white leading-snug truncate">{event.name}</p>
                                    <p className="mt-1 text-xs text-gray-300">Date: {event.date}</p>
                                </div>
                            </div>

                            {/* Manage Event Button Section (Right) */}
                            <button
                                onClick={() => handleManageClick(event.id)}
                                className="ml-4 px-3 py-1 text-xs font-medium text-gray-900 bg-orange-400 rounded hover:bg-orange-500 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 flex-shrink-0"
                                title="View registrations and event details"
                            >
                                Manage
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-300">No events found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default HostedEventsList;