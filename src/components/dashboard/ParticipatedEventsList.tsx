// components/Dashboard/ParticipatedEventsList.tsx
import React from 'react';

interface Event {
    id: string;
    name: string;
    date: string; // Display date
}

interface EventListProps {
    events: Event[];
    title: string;
}

const ParticipatedEventsList: React.FC<EventListProps> = ({ events, title }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id} className="flex space-x-3 items-start border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            {/* Color Indicator */}
                            <div className={`w-1 h-10 mt-1 rounded-full bg-green-500`}></div>

                            <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900 leading-snug">{event.name}</p>
                                <p className="mt-1 text-xs text-gray-500">Date: {event.date}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No events found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default ParticipatedEventsList;