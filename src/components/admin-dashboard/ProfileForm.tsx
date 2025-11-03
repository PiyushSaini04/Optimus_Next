// /src/components/dashboard/ProfileForm.tsx (Corrected)
'use client';
import { useState, useEffect } from 'react';
// FIX 1: Import the named function and use the correct path
import createClient from '@/api/client'; 
import { Profile } from '@/lib/types/supabase';

interface ProfileFormProps {
    table: string; // "profiles"
    initialData: Profile; // Cannot be null as we only support editing existing profiles
    onSuccess: (action: 'updated') => void;
    onCancel: () => void;
}

// Define the shape of the organization data we fetch for the dropdown
interface OrganizationDropdown {
    id: string; 
    name: string;
}

const initializeFormState = (data: Profile): Partial<Profile> => ({
    name: data.name || '',
    role_type: data.role_type || 'user',
    organization_id: data.organization_id || '',
    avatar_url: data.avatar_url || '',
});

export default function ProfileForm({ table, initialData, onSuccess, onCancel }: ProfileFormProps) {
    const [formData, setFormData] = useState<Partial<Profile>>(initializeFormState(initialData));
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<OrganizationDropdown[]>([]);
    
    // FIX 2: Call the client creation function
    const supabase = createClient;
    
    // Fetch list of organizations to populate the dropdown
    useEffect(() => {
        // FIX 3: Explicitly define the type for the fetch response
        const fetchOrgs = async () => {
             const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .returns<OrganizationDropdown[]>(); // Assert the return type

            if (error) {
                console.error('Error fetching organizations:', error);
                return;
            }
            // data is now correctly typed as OrganizationDropdown[]
            if (data) setOrganizations(data); 
        };
        
        fetchOrgs();
        // Removed supabase from dependency array as it is constant
    }, []); 

    useEffect(() => {
        setFormData(initializeFormState(initialData));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // If organization_id is set to an empty string, set it to null for Supabase
        const finalValue = (name === 'organization_id' && value === '') ? null : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    // ... (handleSubmit remains the same, but now uses a working client)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToSubmit: Partial<Profile> = {
            name: formData.name,
            role_type: formData.role_type,
            organization_id: formData.organization_id,
            avatar_url: formData.avatar_url,
            updated_at: new Date().toISOString(), 
        };
        
        // UPDATE Logic: Filter by the profile's UUID
        const { error } = await supabase
            .from(table)
            .update(dataToSubmit)
            .eq('uuid', initialData.uuid); 

        setLoading(false);
        if (error) {
            console.error('Submission Error:', error);
            alert(`Error updating profile: ${error.message}`);
        } else {
            onSuccess('updated');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">
                Edit Profile: {initialData.email}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Email (Read-only) */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Email (Read-Only)</label>
                    <input type="email" value={initialData.email} readOnly className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm p-2 text-gray-400" />
                </div>
                
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2" />
                </div>
                
                {/* Role Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">Role Type</label>
                    <select name="role_type" value={formData.role_type || 'user'} onChange={handleChange} required className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2">
                        <option value="user">user</option>
                        <option value="organizer">organizer</option>
                    </select>
                </div>

                {/* Organization ID */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Organization (Assign/Change)</label>
                    <select name="organization_id" value={formData.organization_id || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2">
                        <option value="">-- No Organization Assigned --</option>
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name} ({org.id.substring(0, 4)}...)</option>
                        ))}
                    </select>
                </div>

                {/* Avatar URL */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Avatar URL</label>
                    <input type="url" name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2" />
                </div>
                
                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-700 disabled:bg-green-400">
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}