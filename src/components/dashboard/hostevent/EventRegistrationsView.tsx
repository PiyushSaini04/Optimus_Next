// components/dashboard/EventRegistrationsView.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import createClient from '@/api/client'; // Import the client creation function
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

// --- Type Definitions ---
interface Registration {
    id: number;
    // user_id is implicit via the join, we use user:users(email)
    created_at: string;
    is_paid: boolean;
    status: 'pending' | 'confirmed' | 'cancelled';
    form_data: any; 
    // This is the structure we expect after the join
    user?: { email: string } | null; 
}

interface EventRegistrationsViewProps {
    eventId: string;
    onBack: () => void;
}
// ----------------------------

const EventRegistrationsView: React.FC<EventRegistrationsViewProps> = ({ eventId, onBack }) => {
    
    // 🟢 CRITICAL FIX: Initialize Supabase Client by CALLING the function
    const supabase = createClient; 

    // --- State Management ---
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Registrations ---
    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            setError(null);
            
            // Fetch from the 'event_registrations' table, filtering by event_id
            const { data, error } = await supabase
                .from('event_registrations')
                .select(`
                    id, 
                    created_at, 
                    is_paid, 
                    status, 
                    form_data, 
                    user:users(email)
                `)
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Fetch Registrations Error:', error.message);
                setError('Could not load registrations details: ' + error.message);
                setRegistrations([]);
            } else if (data) {
                // Ensure data is typed correctly based on the select statement
                setRegistrations(data as unknown as Registration[]); 
            }
            setLoading(false);
        };

        if (eventId) {
            fetchRegistrations();
        }
    }, [eventId, supabase]);

    // Helper to render the status badge
    const StatusBadge = ({ status }: { status: Registration['status'] }) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1";
        switch (status) {
            case 'confirmed':
                return <span className={`${base} bg-green-900 text-green-400`}><CheckCircle2 className="w-3 h-3"/> <span>Confirmed</span></span>;
            case 'pending':
                return <span className={`${base} bg-yellow-900 text-yellow-400`}><Clock className="w-3 h-3"/> <span>Pending</span></span>;
            case 'cancelled':
                return <span className={`${base} bg-red-900 text-red-400`}><XCircle className="w-3 h-3"/> <span>Cancelled</span></span>;
            default:
                return null;
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="bg-gray-800/90 p-10 rounded-xl text-white">Loading registrations...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-700 p-6 rounded-xl text-red-300">
                Error fetching data: {error}
            </div>
        );
    }

    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-2xl min-h-[500px]">
            <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-3xl font-bold text-green-400">
                    👁️ **Event Registrations**
                </h2>
                <Button 
                    onClick={onBack}
                    className="bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-1"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to Events</span>
                </Button>
            </div>

            <p className="text-gray-400 mb-4">Registrations found: **{registrations.length}** for Event ID: **{eventId.substring(0, 8)}...**</p>
            
            {registrations.length === 0 ? (
                <div className="h-64 flex items-center justify-center border border-dashed border-gray-600 rounded-lg">
                    <p className="text-gray-500 text-lg">
                        **No registrations found yet.**
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Reg. ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    User / Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Paid
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Registered On
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Form Data
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800 text-white">
                            {registrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {reg.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {reg.user?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusBadge status={reg.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {reg.is_paid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {/* Display the first field from the JSON data, e.g., 'Name' */}
                                        {reg.form_data ? (reg.form_data.name || Object.values(reg.form_data)[0] || 'View Details') : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationsView;