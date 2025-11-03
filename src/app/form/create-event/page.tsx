// components/CreateEventPage.tsx (or pages/create-event.tsx)
"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/client'; // Adjust path to your Supabase client
import { User } from '@supabase/supabase-js';

// --- 1. TypeScript Interface Definition ---
interface EventFormData {
    title: string;
    description: string;
    category: string;
    location: string;
    organizer_name: string;
    start_date: string;
    end_date: string;
    status: string;
    ticket_price: number | null;
    max_participants: number | null;
    banner_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
}

const initialFormData: EventFormData = {
    title: '',
    description: '',
    category: '',
    location: '',
    organizer_name: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
    ticket_price: null,
    max_participants: null,
    banner_url: null, // This will be set by the file upload result
    contact_email: null,
    contact_phone: null,
};

// **Define the Storage Bucket Name**
const BUCKET_NAME = 'event_banners';

// --- 2. Main Component ---
export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [bannerFile, setBannerFile] = useState<File | null>(null); // New state for the file
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch the current user session (for created_by UUID)
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);


    /** Handles changes to all form inputs (text, number, select). */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            // Convert number inputs to float/int, set empty string to null for optional fields
            [name]: (type === 'number' && value !== '') ? parseFloat(value) : (value === '' ? null : value),
        }));
        setMessage(null);
    };
    
    /** Handles file input changes. */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setBannerFile(file || null);
        setMessage(null);
    };

    /** Uploads the file to Supabase Storage and returns the public URL. */
    const uploadBanner = async (file: File, userId: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        // Storage path: 'event_banners/[user_id]/[file_name]'
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            setMessage({ type: 'error', text: `Banner upload failed: ${uploadError.message}` });
            return null;
        }

        // Get the public URL for the uploaded file
        const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
        return data.publicUrl;
    };
    
    /** Submits the form data to the Supabase 'events' table. */
    // Assuming 'router' is available via useRouter() in the component scope
// Assuming 'router' is available via useRouter() in the component scope
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!user) {
            setMessage({ type: 'error', text: 'You must be logged in to create an event.' });
            setLoading(false);
            return;
        }

        let finalBannerUrl: string | null = null;
        
        // --- STEP 1: UPLOAD BANNER (IF A FILE IS SELECTED) ---
        if (bannerFile) {
            const url = await uploadBanner(bannerFile, user.id);
            if (!url) {
                // Upload failed, message is already set in uploadBanner
                setLoading(false);
                return; 
            }
            finalBannerUrl = url;
        }

        const baseDataToInsert = Object.fromEntries(
            Object.entries(formData).filter(([, value]) => value !== null && value !== '')
        ) as Partial<EventFormData>;

        const dataToInsert = {
            ...baseDataToInsert,
            created_by: user.id, 
            banner_url: finalBannerUrl,
        };

        if (dataToInsert.banner_url === null) {
            delete (dataToInsert as Record<string, any>).banner_url;
        }

        // --- STEP 3: INSERT EVENT DATA & CAPTURE THE NEW ID ---
        // Added .select('id') to return the newly created record's ID
        const { data: newEvent, error } = await supabase
            .from('events')
            .insert([dataToInsert])
            .select('id') // Key modification: Selects the ID of the new row
            .single(); // Expects one row back

        setLoading(false);

        if (error) {
            console.error('Error creating event:', error);
            setMessage({ type: 'error', text: `Failed to create event: ${error.message}` });
        } else if (newEvent && newEvent.id) {
            // --- STEP 4: SUCCESS AND REDIRECT TO FORM BUILDER ---
            setMessage({ type: 'success', text: 'Event created successfully! Redirecting to form builder...' });
            setFormData(initialFormData);
            setBannerFile(null);
            
            // **Navigation logic added here**
            router.push(`/event-page/${newEvent.id}/builder`);
            
        } else {
            // Fallback if insertion was successful but did not return the ID
            setMessage({ type: 'error', text: 'Event created, but failed to get the new ID for redirection.' });
        }
    };

    // --- 3. Tailwind CSS UI ---
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 p-10 bg-gray-800/90 border border-gray-700 shadow-xl rounded-xl">
                <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">
                    Create New Event
                </h2>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-900/50 border border-green-600 text-green-400' : 'bg-red-900/50 border border-red-600 text-red-400'}`}>
                        {message.text}
                    </div>
                )}
                
                {/* Auth Check */}
                {!user && (
                    <div className="p-4 bg-yellow-900/50 border border-yellow-600 text-yellow-400 rounded-md">
                        Please log in to submit an event (required for `created_by` field and banner upload).
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <h3 className="md:col-span-2 text-xl font-semibold text-green-400 border-b border-gray-700 pb-2">Event Details (Required)</h3>

                        {/* ... (Your existing required fields: Title, Organizer Name, Description, Category, Location, Dates, Status) ... */}
                        
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                            <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        
                        {/* Organizer Name */}
                        <div>
                            <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-700">Organizer Name</label>
                            <input id="organizer_name" name="organizer_name" type="text" required value={formData.organizer_name} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Description (Full Width) */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" rows={3} required value={formData.description} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            ></textarea>
                        </div>
                        
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input id="category" name="category" type="text" required value={formData.category} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input id="location" name="location" type="text" required value={formData.location} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Start Date & Time */}
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                            <input id="start_date" name="start_date" type="datetime-local" required value={formData.start_date} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* End Date & Time */}
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date & Time</label>
                            <input id="end_date" name="end_date" type="datetime-local" required value={formData.end_date} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        
                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" required value={formData.status} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>


                        {/* --- Optional Fields Group --- */}
                        <h3 className="md:col-span-2 text-xl font-semibold text-green-400 border-b border-gray-700 pt-4 pb-2">Optional Details</h3>
                        
                        {/* 🌟 New Banner File Input */}
                        <div className="md:col-span-2">
                            <label htmlFor="banner_file" className="block text-sm font-medium text-gray-700">
                                Event Banner Image (Max 5MB recommended)
                            </label>
                            <input 
                                id="banner_file" 
                                name="banner_file" 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-700 file:text-green-400
                                hover:file:bg-gray-600"
                            />
                            {bannerFile && (
                                <p className="mt-1 text-xs text-gray-300">Selected: {bannerFile.name}</p>
                            )}
                        </div>
                        {/* End New Banner File Input 🌟 */}

                        {/* Ticket Price */}
                        <div>
                            <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">Ticket Price (Numeric)</label>
                            <input id="ticket_price" name="ticket_price" type="number" step="0.01" value={formData.ticket_price ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Max Participants */}
                        <div>
                            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">Max Participants (Integer)</label>
                            <input id="max_participants" name="max_participants" type="number" step="1" value={formData.max_participants ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <input id="contact_email" name="contact_email" type="email" value={formData.contact_email ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                            <input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone ?? ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                    </div>

                    <div className="pt-5">
                        <button
                            type="submit"
                            disabled={loading || !user}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Create Form'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}