// components/Dashboard/EventStatsGrid.tsx
import React from 'react';

interface EventStatsGridProps {
    participated: number;
    hosted: number;
}

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="rounded-xl shadow-lg p-6 flex flex-col justify-between bg-white border border-gray-100">
        <h3 className="text-lg text-gray-500 font-medium">{title}</h3>
        <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-2">View all events</p>
    </div>
);

const EventStatsGrid: React.FC<EventStatsGridProps> = ({ participated, hosted }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
                title="Events Participated"
                value={participated}
                color="text-green-700"
            />
            <StatCard
                title="Events Hosted"
                value={hosted}
                color="text-blue-700"
            />
        </div>
    );
};

export default EventStatsGrid;