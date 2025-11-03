import React, { useState } from 'react';

interface Event {
    id: string; // Event ID
    name: string; // Event name (title)
    date: string; // Display date
    ticket_uid: string; // Crucial for displaying the ticket
}

interface EventListProps {
    events: Event[];
    title: string;
}

const ParticipatedEventsList: React.FC<EventListProps> = ({ events, title }) => {
    // State to manage the visibility and content of the Ticket ID modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTicketUid, setCurrentTicketUid] = useState('');

    const handleViewTicket = (ticketUid: string) => {
        setCurrentTicketUid(ticketUid);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTicketUid('');
    };

    return (
        <>
            {/* The main container now includes custom scrollbar classes */}
            <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-900">
                
                <h2 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 mb-4">{title}</h2>

                {/* The inner list container */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="flex space-x-3 items-center justify-between border-b border-gray-700 pb-4 last:border-b-0 last:pb-0"
                            >
                                {/* Event Details Section */}
                                <div className="flex space-x-3 items-start flex-1 min-w-0">
                                    {/* Color Indicator */}
                                    <div className={`w-1 h-10 mt-1 rounded-full bg-green-400 flex-shrink-0`}></div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-white leading-snug truncate">
                                            {event.name}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-300">Date: {event.date}</p>
                                    </div>
                                </div>

                                {/* View Ticket Button Section */}
                                <button
                                    onClick={() => handleViewTicket(event.ticket_uid)}
                                    className="ml-4 px-3 py-1 text-xs font-medium text-gray-900 bg-green-400 rounded hover:bg-green-500 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 flex-shrink-0"
                                >
                                    View Ticket
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-300">No events found in this category.</p>
                    )}
                </div>
            </div>

            {/* --- Ticket ID Modal --- */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                    onClick={closeModal} // Close modal when clicking outside
                >
                    <div
                        className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full m-4 transform transition-all"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                            Ticket Information
                        </h3>

                        <div className="space-y-4">
                            <p className="text-gray-300 text-sm">Your unique registration ID (Ticket ID):</p>
                            <div className="p-3 bg-gray-900 rounded-lg break-all">
                                <code className="text-lg text-green-400 font-mono select-all">
                                    {currentTicketUid}
                                </code>
                            </div>
                            <p className="text-xs text-gray-500">
                                Please keep this ID safe for event check-in.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition duration-150"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParticipatedEventsList;