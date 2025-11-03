// /src/components/dashboard/RegistrationModal.tsx (Type-Safe Version)
'use client';
import { useState, useEffect } from 'react';
// FIX 1: Import the named function and use the correct path
import createClient from '@/api/client';
import { X, CheckCircle, Trash2 } from 'lucide-react';

// Assuming base types from the previous section
import { Event, UUID } from '@/lib/types/supabase'; 

// [Insert RegistrationRow and RegistrationModalProps interfaces here or import them]

// Define the expected structure of a single registration record with joined profile data
interface RegistrationRow {
    id: UUID; // Registration ID (UUID, typically a string)
    is_paid: boolean; 
    status: string; 
    registration_date: string;
    check_in_time: string | null;
    profiles: {
        email: string;
        name: string | null;
    } | null;
}

interface RegistrationModalProps {
    event: Event & { id: string }; // Assuming Event has an 'id' of type string
    onClose: () => void;
}

export default function RegistrationModal({ event, onClose }: RegistrationModalProps) { // <-- Props are typed
    // FIX 2: Type the state
    const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
    const [loading, setLoading] = useState(true);
    
    // FIX 3: Call the client creation function
    const supabase = createClient;
    
    const eventId = event.id;

    const fetchRegistrations = async () => {
        setLoading(true);
        // Use .returns<T[]>() for clear type assertion on the query result
        const { data, error } = await supabase
            .from('event_registrations')
            .select(`
                id, is_paid, status, registration_date, check_in_time,
                profiles(email, name)
            `)
            .eq('event_id', eventId)
            .order('registration_date', { ascending: false })
            .returns<RegistrationRow[]>(); // Assert the return type

        if (error) console.error('Error fetching registrations:', error);
        
        // FIX 4: data is now correctly typed
        if (data) setRegistrations(data); 
        
        setLoading(false);
    };

    // ... useEffect remains the same

    // FIX 5: Type the handler parameters (regId is UUID/string, newStatus is string)
    const handleUpdateStatus = async (regId: UUID, newStatus: string) => {
        const { error } = await supabase
            .from('event_registrations')
            .update({ status: newStatus })
            .eq('id', regId);

        if (error) console.error('Status update error:', error);
        else fetchRegistrations();
    };

    // FIX 6: Type the handler parameter (regId is UUID/string)
    const handleDeleteRegistration = async (regId: UUID) => {
        if (!confirm('Are you sure you want to delete this registration?')) return;
        const { error } = await supabase.from('event_registrations').delete().eq('id', regId);
        if (error) console.error('Delete error:', error);
        else fetchRegistrations();
    };
    
    const registrationStatusOptions = ['Pending', 'Confirmed', 'Cancelled', 'Checked-In'];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                    <h3 className="text-2xl font-bold text-green-400">
                        Registrations for: **{event.title}**
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-green-400 p-1 rounded-full bg-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-center py-10 text-gray-300">Loading registrations...</p>
                ) : registrations.length === 0 ? (
                    <p className="text-center py-10 text-gray-300">No registrations found.</p>
                ) : (
                    <div className="overflow-y-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-700">
                            {/* ... table headers remain the same ... */}
                            <thead className="bg-gray-800 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase border-b border-gray-700">Email / Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase border-b border-gray-700">Registration Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase border-b border-gray-700">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase border-b border-gray-700">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-green-400 uppercase border-b border-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/90 divide-y divide-gray-700">
                                {registrations.map((reg: RegistrationRow) => ( // <-- reg is now typed
                                    <tr key={reg.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-300">
                                            {/* FIX 7: Accessing typed properties safely */}
                                            {reg.profiles?.email || 'N/A'} <br />
                                            <span className="text-xs text-gray-400">{reg.profiles?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {/* FIX 8: Accessing typed properties safely */}
                                            {new Date(reg.registration_date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.is_paid ? 'bg-green-900/50 border border-green-600 text-green-400' : 'bg-red-900/50 border border-red-600 text-red-400'}`}>
                                                {/* FIX 9: Conditional display based on boolean */}
                                                {reg.is_paid ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <select 
                                                value={reg.status} // <-- Accessing typed property
                                                onChange={(e) => handleUpdateStatus(reg.id, e.target.value)}
                                                className="p-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                                            >
                                                {registrationStatusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => handleUpdateStatus(reg.id, 'Checked-In')} title="Check In" className="text-green-400 hover:text-green-500">
                                                <CheckCircle size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteRegistration(reg.id)} title="Delete Registration" className="text-red-400 hover:text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}