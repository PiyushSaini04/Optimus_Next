// components/CreateEventPage.tsx (or pages/create-event.tsx)
"use client";

import React, { useState, FormEvent, useEffect } from 'react';
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


        // --- STEP 2: PREPARE DATA FOR POSTGRES INSERT ---
        // 1. Filter out keys where the value is explicitly null or empty string
        const baseDataToInsert = Object.fromEntries(
            Object.entries(formData).filter(([, value]) => value !== null && value !== '')
        ) as Partial<EventFormData>;

        // 2. Add the created_by UUID and the final banner URL
        const dataToInsert = {
            ...baseDataToInsert,
            created_by: user.id, 
            banner_url: finalBannerUrl, // Insert the obtained URL (or null)
        };
        
        // 3. Ensure banner_url is removed if it's null, to avoid inserting a column that might not be in the table structure if the property is optional.
        if (dataToInsert.banner_url === null) {
            delete dataToInsert.banner_url;
        }

        // --- STEP 3: INSERT EVENT DATA TO POSTGRES ---
        const { error } = await supabase
            .from('events') // **Double-check your table name is 'events'**
            .insert([dataToInsert]);

        setLoading(false);

        if (error) {
            console.error('Error creating event:', error);
            setMessage({ type: 'error', text: `Failed to create event: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Event created successfully! Banner uploaded.' });
            setFormData(initialFormData); // Reset form
            setBannerFile(null); // Reset file input state
            // Note: Manually reset file input element if needed (often not necessary with full state reset)
        }
    };

    // --- 3. Tailwind CSS UI ---
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Create New Event
                </h2>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                
                {/* Auth Check */}
                {!user && (
                    <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
                        Please log in to submit an event (required for `created_by` field and banner upload).
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <h3 className="md:col-span-2 text-xl font-semibold text-indigo-600 border-b pb-2">Event Details (Required)</h3>

                        {/* ... (Your existing required fields: Title, Organizer Name, Description, Category, Location, Dates, Status) ... */}
                        
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        
                        {/* Organizer Name */}
                        <div>
                            <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-700">Organizer Name</label>
                            <input id="organizer_name" name="organizer_name" type="text" required value={formData.organizer_name} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Description (Full Width) */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" rows={3} required value={formData.description} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            ></textarea>
                        </div>
                        
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input id="category" name="category" type="text" required value={formData.category} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input id="location" name="location" type="text" required value={formData.location} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Start Date & Time */}
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                            <input id="start_date" name="start_date" type="datetime-local" required value={formData.start_date} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* End Date & Time */}
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date & Time</label>
                            <input id="end_date" name="end_date" type="datetime-local" required value={formData.end_date} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        
                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" required value={formData.status} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>


                        {/* --- Optional Fields Group --- */}
                        <h3 className="md:col-span-2 text-xl font-semibold text-gray-600 border-b pt-4 pb-2">Optional Details</h3>
                        
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
                                file:bg-violet-50 file:text-indigo-700
                                hover:file:bg-violet-100"
                            />
                            {bannerFile && (
                                <p className="mt-1 text-xs text-gray-500">Selected: {bannerFile.name}</p>
                            )}
                        </div>
                        {/* End New Banner File Input 🌟 */}

                        {/* Ticket Price */}
                        <div>
                            <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">Ticket Price (Numeric)</label>
                            <input id="ticket_price" name="ticket_price" type="number" step="0.01" value={formData.ticket_price ?? ''} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Max Participants */}
                        <div>
                            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">Max Participants (Integer)</label>
                            <input id="max_participants" name="max_participants" type="number" step="1" value={formData.max_participants ?? ''} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <input id="contact_email" name="contact_email" type="email" value={formData.contact_email ?? ''} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                            <input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone ?? ''} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                    </div>

                    <div className="pt-5">
                        <button
                            type="submit"
                            disabled={loading || !user}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}