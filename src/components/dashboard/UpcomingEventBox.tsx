// components/Dashboard/UpcomingEventBox.tsx
import React, { useState, useEffect } from 'react';

interface Event {
    name: string;
    date: Date; // Use Date object for accurate timing
}

interface UpcomingEventBoxProps {
    event: Event | null;
}

// Custom hook for the countdown timer
const useCountdown = (targetDate: Date | null) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft() as { days: number, hours: number, minutes: number, seconds: number });
        }, 1000);

        // Calculate initially
        setTimeLeft(calculateTimeLeft() as { days: number, hours: number, minutes: number, seconds: number });

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};


const UpcomingEventBox: React.FC<UpcomingEventBoxProps> = ({ event }) => {
    const timeLeft = useCountdown(event ? event.date : null);
    const hasStarted = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-sm h-64 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Upcoming Event (Participated)</h2>
            
            {event && !hasStarted ? (
                <div className="flex flex-col items-center justify-center flex-1">
                    <p className="font-bold text-lg text-white text-center">{event.name}</p>
                    <p className="text-sm text-gray-300 mb-4">Starts at: {event.date.toLocaleTimeString()}</p>
                    
                    {/* Countdown Timer */}
                    <div className="flex space-x-4 text-center">
                        {Object.entries(timeLeft).map(([unit, value]) => (
                            <div key={unit} className="bg-gray-700 p-3 rounded-lg w-16 border border-gray-600">
                                <span className="text-2xl font-mono font-bold text-green-400">{String(value).padStart(2, '0')}</span>
                                <p className="text-xs text-gray-400 uppercase mt-1">{unit.charAt(0)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-300">{event ? "The event has started!" : "No upcoming events scheduled."}</p>
                </div>
            )}
        </div>
    );
};

export default UpcomingEventBox;