// components/ProfileSettingsForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import supabaset from '@/api/client'; // Your Supabase client instance
import { Button } from '@/components/ui/button'; // Your Button component (e.g., shadcn/ui)
import { Input } from '@/components/ui/input'; // Your Input component (e.g., shadcn/ui)
import { Label } from '@/components/ui/label'; // Your Label component (e.g., shadcn/ui)
import Image from 'next/image';

// --- Type Definitions ---
interface ProfileUpdateData {
    name: string | null;
    avatar_url: string | null;
    phone_number: string | null; // Phone number is now managed here
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
        phone_number: '', // Initialize phone_number state
    });
    
    // State to hold the email, fetched separately but not editable
    const [email, setEmail] = useState<string>(''); 
    // State to manage loading/submission UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // State for user feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // --- Data Fetching: Load existing profile data and user email ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            
            try {
                // 1. Get Auth User Data (for email)
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.email) {
                    setEmail(user.email);
                }

                // 2. Fetch Profile Table Data (for name, avatar_url, phone_number)
                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('name, avatar_url, phone_number') // Select phone_number
                    .eq('uuid', userId)
                    .single();

                if (profileError) {
                    throw profileError;
                }
                
                if (data) {
                    setProfileData({
                        name: data.name ?? '',
                        avatar_url: data.avatar_url ?? '',
                        phone_number: data.phone_number ?? '', // Set phone_number
                    });
                } 
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId, supabase]);

    // --- Avatar Upload Logic (Simplified: Phone update removed) ---
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
            setSuccess(null);

            // Generate a unique file path for the storage bucket
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Date.now()}.${fileExt}`;

            // 1. Upload the file to the 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = publicUrlData.publicUrl;

            // 3. Update the profile with the new avatar URL
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

    // --- Form Handling for Name and Phone Number Update ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            // Uses the input id ('name' or 'phone_number') to dynamically update state
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
        
        // Payload includes name and phone_number
        const updatePayload: Partial<ProfileUpdateData> = {
            name: profileData.name,
            phone_number: profileData.phone_number,
            // avatar_url is updated separately in handleAvatarUpload
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
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
        return <div className="p-6 text-center text-gray-300">Loading profile...</div>;
    }
    
    return (
        <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-green-400 border-b border-gray-700 pb-2">Profile Settings</h2>
            
            {/* Display Messages */}
            {error && <div className="bg-red-900/50 border border-red-600 text-red-400 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-900/50 border border-green-600 text-green-400 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field (Non-Editable) */}
                <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address (Not Editable)</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        readOnly 
                        disabled 
                        className="mt-1 bg-gray-800 border-gray-700 text-gray-400"
                    />
                </div>

                {/* Name Field */}
                <div>
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input 
                        id="name" 
                        type="text" 
                        value={profileData.name || ''} 
                        onChange={handleChange} 
                        className="mt-1"
                    />
                </div>
                
                {/* Phone Number Field */}
                <div>
                    <Label htmlFor="phone_number" className="text-gray-300">Phone Number</Label>
                    <Input 
                        id="phone_number" // Matches the key in profileData state
                        type="tel" // Use type="tel" for phone numbers
                        value={profileData.phone_number || ''} 
                        onChange={handleChange} 
                        className="mt-1"
                        placeholder="e.g., +1 555 123 4567"
                    />
                </div>

                {/* Avatar Upload Field */}
                <div>
                    <Label className="text-gray-300 block mb-2">Profile Picture</Label>
                    
                    {profileData.avatar_url && (
                        <div className="mb-4">
                            <Image
                                src={profileData.avatar_url}
                                alt="Current Avatar"
                                className="rounded-full object-cover border-2 border-green-500"
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
                        className="mt-1 block w-full text-sm text-gray-300 border border-gray-700 rounded-lg cursor-pointer bg-gray-800"
                    />
                    {isUploading && <p className="text-sm text-green-400 mt-1">Uploading...</p>}
                    <p className="text-xs text-gray-400 mt-1">
                        Upload a new file. This will automatically update your profile picture.
                    </p>
                </div>
                
                {/* Submit Button (Handles Name and Phone number change) */}
                <Button 
                    type="submit" 
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 transition duration-150"
                >
                    {isSubmitting ? 'Saving Profile...' : 'Update Name & Phone'}
                </Button>
            </form>
        </div>
    );
};

export default ProfileSettingsForm;