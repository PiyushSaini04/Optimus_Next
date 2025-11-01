// components/Forms/OrganizationBox.tsx
'use client';
import React, { useState } from 'react';
import supabase from '@/api/client'; // Your Supabase client import
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface OrganizationBoxProps {
    onSuccess: () => void;
    currentUserId: string; // The authenticated user's UUID
}

const OrganizationBox: React.FC<OrganizationBoxProps> = ({ onSuccess, currentUserId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- 1. Handle File Upload (Uploads to Storage Bucket) ---
    const uploadLogo = async (orgId: string): Promise<string | null> => {
        if (!logoFile) return null;

        const fileExtension = logoFile.name.split('.').pop();
        const filePath = `${orgId}/${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
            .from('organization_logos') // Use the bucket name you created
            .upload(filePath, logoFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error('Failed to upload organization logo.');
        }

        // Return the public URL for the image
        const { data: publicUrlData } = supabase.storage
            .from('organization_logos')
            .getPublicUrl(filePath);
            
        return publicUrlData.publicUrl;
    };

    // --- 2. Handle Form Submission (Inserts into Table with Rollback) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!name.trim()) {
            setError('Organization name is required.');
            setLoading(false);
            return;
        }
        
        let newOrgId: string | null = null; 

        try {
            // 1. Insert the new organization record to get its UUID
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: name.trim(),
                    description: description.trim(),
                    owner_id: currentUserId,
                    status: 'Pending',
                })
                .select('id')
                .single();

            if (orgError || !orgData) {
                console.error(orgError);
                throw new Error('Failed to create organization record.');
            }
            
            let newOrgId: string | null = orgData.id ?? null;
            let avatarUrl: string | null = null;
            
            // 2. Upload Logo and get URL (if file exists)
            if (logoFile && newOrgId) {
                try {
                    avatarUrl = await uploadLogo(newOrgId);
                    
                    // 3. Update the organization record with the logo URL
                    const { error: updateError } = await supabase
                    .from('organizations') // Assuming the table is named 'organizations'
                    .update({ avatar_url: avatarUrl })
                    .eq('id', newOrgId);
                    
                    if (updateError) {
                         throw new Error('Failed to update organization with logo URL.');
                    }
                } catch (logoError) {
                    console.error('Logo process failed:', logoError);
                    throw logoError; 
                }
            }
            
            // 4. Link the organization ID back to the user's profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ organisation_id: newOrgId })
                .eq('uuid', currentUserId);

            if (profileError) {
                console.error('Profile Update Error:', profileError);
                // Throw an error that triggers the cleanup in the catch block
                throw new Error('Failed to link organization to your profile.');
            }

            alert('Organization successfully registered! Awaiting admin approval.');
            onSuccess(); // Run success callback
        } catch (err: any) {
            // --- 🧹 CLEANUP LOGIC: Delete the organization if anything failed after creation ---
            if (newOrgId) {
                console.log(`Cleaning up organization ${newOrgId} due to subsequent failure.`);
                await supabase.from('organizations').delete().eq('id', newOrgId);
                
                // Provide context to the user about the cleanup
                const finalError = `${err.message || 'An unknown error occurred during registration.'} The new organization record was removed to ensure a clean state. Please check your profile RLS policy.`;
                setError(finalError);
            } else {
                // If newOrgId is null, the failure happened during the initial organization creation
                setError(err.message || 'An unknown error occurred during registration.');
            }
            // ---------------------------------------------------------------------------------
        } finally {
            setLoading(false);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="w-150 p-6 bg-grey-100 flex flex-col mx-auto align-middle gap-4 rounded-lg shadow-md" 
            aria-label="Register organization form"
        >
            <h2 className="text-2xl font-bold text-gray-900">Register Your Organization</h2>

            {error && (
                <div role="alert" className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Organization Name */}
            <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">Organization Name *</label>
                <input
                    id="org-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="org-desc" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="org-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {/* Logo Upload */}
            <div>
                <label htmlFor="org-logo" className="block text-sm font-medium text-gray-700">Organization Logo (Optional)</label>
                <input
                    id="org-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
            >
                {loading ? 'Submitting...' : 'Register Organization'}
            </Button>
        </form>
    );
};

export default OrganizationBox;