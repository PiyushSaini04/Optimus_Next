// components/Forms/RegisterOrganizationForm.tsx
'use client';
import React, { useState } from 'react';
import supabase from '@/api/client'; // Your Supabase client import
import { Button } from '@/components/ui/button';

interface RegisterOrganizationFormProps {
    onSuccess: () => void;
    currentUserId: string; // The authenticated user's UUID
}

const RegisterOrganizationForm: React.FC<RegisterOrganizationFormProps> = ({ onSuccess, currentUserId }) => {
    // ... (State declarations remain the same) ...
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- 1. Handle File Upload (Unchanged) ---
    const uploadLogo = async (orgId: string): Promise<string | null> => {
        // ... (Upload logic remains the same) ...
        if (!logoFile) return null;

        const fileExtension = logoFile.name.split('.').pop();
        const filePath = `${orgId}/${Date.now()}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('organization_logos')
            .upload(filePath, logoFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error('Failed to upload organization logo.');
        }

        const { data: publicUrlData } = supabase.storage
            .from('organization_logos')
            .getPublicUrl(filePath);
            
        return publicUrlData.publicUrl;
    };

    // --- 2. Handle Form Submission (WITH CLEANUP LOGIC) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!name.trim()) {
            setError('Organization name is required.');
            setLoading(false);
            return;
        }
        
        // This will hold the ID if the organization is created
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
            
            newOrgId = orgData.id;
            let avatarUrl: string | null = null;
            
            // 2. Upload Logo and get URL (if file exists)
            if (logoFile) {
                // NOTE: Using a nested try/catch for logo upload/update is safer for cleanup
                try {
                    avatarUrl = await uploadLogo(newOrgId!);
                    
                    // 3. Update the organization record with the logo URL
                    const { error: updateError } = await supabase
                        // ❌ FIX: The table name was 'organisations' - should be 'organizations' or what is in your DB
                        .from('organizations') 
                        .update({ avatar_url: avatarUrl })
                        .eq('id', newOrgId!);

                    if (updateError) {
                         // Throw a distinct error to allow cleanup below
                         throw new Error('Failed to update organization with logo URL.');
                    }
                } catch (logoError) {
                    console.error('Logo process failed:', logoError);
                    // Re-throw the error to trigger the main catch block and cleanup
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
                // This is the specific error the user reported failing. We will clean up the ORG!
                throw new Error('Failed to link organization to your profile (RLS issue likely).');
            }

            alert('Organization successfully registered! Awaiting admin approval.');
            onSuccess(); // Run success callback
        } catch (err: any) {
            // --- 🧹 CLEANUP LOGIC: Delete the organization if anything failed after creation ---
            if (newOrgId) {
                console.log(`Cleaning up organization ${newOrgId} due to subsequent failure.`);
                await supabase.from('organizations').delete().eq('id', newOrgId);
                const finalError = `${err.message || 'An unknown error occurred during registration.'} The new organization record was removed to ensure a clean state.`;
                setError(finalError);
            } else {
                // If newOrgId is null, the failure happened during step 1 (creation)
                setError(err.message || 'An unknown error occurred during registration.');
            }
            // ---------------------------------------------------------------------------------
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Register organization form">
            {error && (
                <div role="alert" className="text-sm text-red-600">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
                    Organization Name
                </label>
                <input
                    id="org-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    placeholder="Enter organization name"
                    aria-required="true"
                />
            </div>

            <div>
                <label htmlFor="org-description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="org-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    placeholder="Brief description (optional)"
                    rows={4}
                />
            </div>

            <div>
                <label htmlFor="org-logo" className="block text-sm font-medium text-gray-700">
                    Logo (optional)
                </label>
                <input
                    id="org-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full"
                />
                {logoFile && (
                    <p className="mt-1 text-sm text-gray-600">Selected file: {logoFile.name}</p>
                )}
            </div>

            <div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Register Organization'}
                </Button>
            </div>
        </form>
    );
};

export default RegisterOrganizationForm;