// /src/components/dashboard/OrganizationForm.tsx
'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import { Organization } from '@/lib/types/supabase';

interface OrganizationFormProps {
    table: string; // "organizations"
    initialData: Organization | null;
    onSuccess: (action: 'inserted' | 'updated') => void;
    onCancel: () => void;
}

const initializeFormState = (data: Organization | null): Partial<Organization> => ({
    name: data?.name || '',
    description: data?.description || '',
    owner_id: data?.owner_id || '', // UUID
    status: data?.status || 'Active',
    avatar_url: data?.avatar_url || '',
});

export default function OrganizationForm({ table, initialData, onSuccess, onCancel }: OrganizationFormProps) {
    const [formData, setFormData] = useState<Partial<Organization>>(initializeFormState(initialData));
    const [loading, setLoading] = useState(false);
    const supabase = createClient;
    
    const isEditing = !!initialData;

    useEffect(() => {
        setFormData(initializeFormState(initialData));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToSubmit = { ...formData };
        
        let supabaseResponse;
        if (isEditing) {
            // UPDATE Logic
            supabaseResponse = await supabase
                .from(table)
                .update(dataToSubmit)
                .eq('id', initialData!.id); 
        } else {
            // INSERT Logic
            supabaseResponse = await supabase
                .from(table)
                .insert([dataToSubmit]);
        }

        setLoading(false);
        if (supabaseResponse.error) {
            console.error('Submission Error:', supabaseResponse.error);
            alert(`Error saving data: ${supabaseResponse.error.message}`);
        } else {
            onSuccess(isEditing ? 'updated' : 'inserted');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">
                {isEditing ? `Edit Organization (ID: ${initialData?.id.substring(0, 8)}...)` : 'Add New Organization'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">Organization Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm p-2 text-white" />
                </div>
                
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2">
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>

                {/* Owner ID (UUID - often a read-only field or select) */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Owner ID (auth.users.id)</label>
                    <input type="text" name="owner_id" value={formData.owner_id} onChange={handleChange} placeholder="UUID of the owner user" className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2 bg-gray-800" />
                </div>
                
                {/* Description */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2"></textarea>
                </div>
                
                {/* Avatar URL */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Avatar URL</label>
                    <input type="url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm p-2" />
                </div>
                
                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-700 disabled:bg-green-400">
                        {loading ? 'Saving...' : (isEditing ? 'Update Organization' : 'Create Organization')}
                    </button>
                </div>
            </form>
        </div>
    );
}