// components/Dashboard/HostedEventsList.tsx
import React from 'react';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline'; // Importing icons

interface Event {
    id: string;
    name: string; // event title
    date: string; // Display date
}

interface EventListProps {
    events: Event[];
    title: string;
    // Handlers passed from the parent (DashboardPage) to manage state/modals
    onEditEvent: (eventId: string) => void;
    onViewRegistrations: (eventId: string) => void;
}

const HostedEventsList: React.FC<EventListProps> = ({ events, title, onEditEvent, onViewRegistrations }) => {
    
    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-900 scrollbar-thumb-rounded-10">            
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

                            {/* Action Buttons Section (Right) */}
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                
                                {/* 1. View Registrations Button (Eye Icon) */}
                                <button
                                    onClick={() => onViewRegistrations(event.id)}
                                    className="p-2 text-gray-300 bg-gray-700 rounded hover:bg-green-600 hover:text-white transition duration-150 ease-in-out"
                                    title="View Event Registrations"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>

                                {/* 2. Edit Event Button (Pencil Icon) */}
                                <button
                                    onClick={() => onEditEvent(event.id)}
                                    className="p-2 text-gray-900 bg-orange-400 rounded hover:bg-orange-500 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                                    title="Edit Event Details"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                
                            </div>
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