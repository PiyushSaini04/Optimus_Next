// components/ProfileSettingsForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import supabaset from '@/api/client'; // Assuming this is your Supabase client
import { Button } from '@/components/ui/button'; // Assuming you have a button component
import { Input } from '@/components/ui/input'; // Assuming you have an input component
import { Label } from '@/components/ui/label'; // Assuming you have a label component
import Image from 'next/image';

// Define the structure of the data you'll fetch/update
interface ProfileUpdateData {
    name: string | null;
    avatar_url: string | null;
}

interface ProfileSettingsFormProps {
    userId: string; 
    onUpdateComplete: () => void; 
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ userId, onUpdateComplete }) => {
    const supabase = supabaset; 
    const [profileData, setProfileData] = useState<ProfileUpdateData>({
        name: '',
        avatar_url: '',
    });
    // State to hold the email, fetched separately but not editable
    const [email, setEmail] = useState<string>(''); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // --- Data Fetching: Load existing profile data and user email ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            
            // 1. Get Auth User Data (for email)
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setEmail(user.email);
            }

            // 2. Fetch Profile Table Data (for name and avatar_url)
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('uuid', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                setError('Failed to load profile data.');
            } else if (data) {
                setProfileData({
                    name: data.name ?? '',
                    avatar_url: data.avatar_url ?? '',
                });
            } 
            setIsLoading(false);
        };

        fetchUserData();
    }, [userId, supabase]);

    // --- Avatar Upload Logic ---
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!userId) {
                setError("User not authenticated for upload.");
                return;
            }

            const file = event.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            setError(null);

            // Generate a unique file path for the storage bucket
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Date.now()}.${fileExt}`;
            
            // Upload the file to the 'avatars' bucket
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL for the newly uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = publicUrlData.publicUrl;

            // Update the profile with the new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: newAvatarUrl })
                .eq('uuid', userId);

            if (updateError) {
                throw updateError;
            }
            
            // Update local state and show success
            setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
            setSuccess('Avatar updated successfully!');

        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            setError(`Avatar upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    // --- Form Handling for Name Update ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [id]: value
        }));
        setSuccess(null); 
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        // Only submit the fields that are left (name and avatar_url)
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ name: profileData.name }) // avatar_url is updated in handleAvatarUpload
            .eq('uuid', userId); 

        if (updateError) {
            console.error('Error updating profile:', updateError);
            setError(`Update failed: ${updateError.message}`);
        } else {
            setSuccess('Profile updated successfully!');
            setTimeout(onUpdateComplete, 1500);
        }

        setIsSubmitting(false);
    };
    
    // --- Render Logic ---
    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
    }
    
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Profile Settings</h2>
            
            {/* Display Messages */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field (Non-Editable) */}
                <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address (Not Editable)</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        readOnly // Makes the field non-editable
                        disabled // Visually indicates it's non-editable
                        className="mt-1 bg-gray-100 dark:bg-gray-700"
                    />
                </div>

                {/* Name Field */}
                <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input 
                        id="name" 
                        type="text" 
                        value={profileData.name || ''} 
                        onChange={handleChange} 
                        className="mt-1"
                    />
                </div>
                
                {/* Avatar Upload Field */}
                <div>
                    <Label className="text-gray-700 dark:text-gray-300 block mb-2">Profile Picture</Label>
                    
                    {profileData.avatar_url && (
                        <div className="mb-4">
                            <Image
                                src={profileData.avatar_url}
                                alt="Current Avatar"
                                className="rounded-full object-cover border-2 border-blue-500"
                                width={96}
                                height={96}
                            />
                        </div>
                    )}

                    <Input 
                        id="avatar_upload" 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploading || isSubmitting}
                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                    />
                    {isUploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                    <p className="text-xs text-gray-500 mt-1">
                        Upload a new file. This will automatically update your profile.
                    </p>
                </div>
                
                {/* Submit Button (Only handles name change now) */}
                <Button 
                    type="submit" 
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition duration-150"
                >
                    {isSubmitting ? 'Saving Name...' : 'Update Name'}
                </Button>
            </form>
        </div>
    );
};

export default ProfileSettingsForm;