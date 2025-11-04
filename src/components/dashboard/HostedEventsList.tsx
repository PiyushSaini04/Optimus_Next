// components/Dashboard/HostedEventsList.tsx
// ... (imports)
import { LinkIcon } from '@heroicons/react/24/outline'; 
import Link from 'next/link'; 

// ... (interface definitions)
interface HostedEvent {
    id: string;
    name: string;
    date: string; 
    // Add other fields you display or use, like:
    // status: 'pending' | 'confirmed' | 'cancelled';
}

interface EventListProps {
    events: HostedEvent[];
    title: string;
    onEditEvent?: (eventId: string) => void;
    onViewRegistrations?: (eventId: string) => void;
}

const HostedEventsList: React.FC<EventListProps> = ({ events, title }) => {
    
    // 💡 CRITICAL FIX: The link must point to the new dynamic route structure.
    // Path: /dashboard/eventmanage/{eventId}
    const getManagementLink = (eventId: string) => `/dashboard/eventmanage/${eventId}`;

    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-900 scrollbar-thumb-rounded-10">
            {/* ... (title and structure) */}

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {events.length > 0 ? (
                    events.map((event) => (
                        <div 
                            key={event.id} 
                            className="flex space-x-3 items-center justify-between border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                        >
                            {/* Event Details Section (Left) */}
                            <div className="flex space-x-3 items-start flex-1 min-w-0">
                                <div className={`w-1 h-10 mt-1 rounded-full bg-green-400 flex-shrink-0`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-white leading-snug truncate">{event.name}</p>
                                    <p className="mt-1 text-xs text-gray-300">Date: {event.date}</p>
                                </div>
                            </div>

                            {/* Action Button Section (Right) - Single Link */}
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                {/* Single Management Link Button */}
                                <Link
                                    href={getManagementLink(event.id)} // <--- Uses the new link structure
                                    className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-200 ease-in-out shadow-md"
                                    title="Go to Event Management Page"
                                >
                                    <LinkIcon className="w-4 h-4" /> 
                                </Link>
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