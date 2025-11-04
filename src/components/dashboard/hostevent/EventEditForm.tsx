// components/dashboard/hostevent/EventEditForm.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming this Button component is available
import createClient from '@/api/client'; // Assuming this exports a function that returns a Supabase client
import { XCircle, Loader2 } from 'lucide-react'; 

// --- Interface Definitions ---
const STATUS_OPTIONS: string[] = ['pending', 'confirmed', 'cancelled', 'archived']; 

interface EventEditFormProps {
    eventId: string;
    onCancel: () => void;
    onEventUpdated: () => void;
}

// Basic structure for ALL editable fields based on your schema
interface EditableEvent {
    title: string;
    description: string;
    category: string;
    location: string;
    organizer_name: string;
    start_date: string; // Formatted for datetime-local
    end_date: string | null; // Formatted for datetime-local
    status: string; // EventStatus
    ticket_price: number | null;
    max_participants: number | null;
    banner_url: string | null; // This will store the public URL
    contact_email: string | null;
    contact_phone: string | null;
}
// ----------------------------

const EventEditForm: React.FC<EventEditFormProps> = ({ eventId, onCancel, onEventUpdated }) => {
    
    // 🟢 CRITICAL FIX: Call the client creation function with ()
    const supabase = createClient; 
    const router = useRouter();

    // --- State Management ---
    const [formData, setFormData] = useState<EditableEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false); 
    const [error, setError] = useState<string | null>(null);

    // Function to format the database timestamp into the format required by datetime-local input
    const formatTimestampForInput = (timestamp: string | null) => {
        if (!timestamp) return '';
        // Truncate to 'YYYY-MM-DDTHH:MM' format
        return timestamp.substring(0, 16); 
    };

    // --- 1. Fetch Event Details ---
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError(null);
            
            const { data, error } = await supabase
                .from('events')
                .select(`
                    title, description, category, location, organizer_name, 
                    start_date, end_date, status, ticket_price, max_participants, 
                    banner_url, contact_email, contact_phone
                `)
                .eq('id', eventId)
                .single();
            
            if (error || !data) {
                console.error('Fetch Event Error:', error?.message || 'No data returned.');
                // Display specific error if data fetching fails
                setError(`Could not load event details for ID: ${eventId}. Please check if the ID exists and policies allow access.`);
            } else {
                // Map fetched data to form data, formatting dates and handling nulls/numbers
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || '',
                    location: data.location || '',
                    organizer_name: data.organizer_name || '',
                    status: data.status || 'pending',
                    
                    // Dates must be formatted for input type="datetime-local"
                    start_date: formatTimestampForInput(data.start_date),
                    end_date: formatTimestampForInput(data.end_date),

                    // Optional fields
                    ticket_price: data.ticket_price || null,
                    max_participants: data.max_participants || null,
                    banner_url: data.banner_url || null,
                    contact_email: data.contact_email || null,
                    contact_phone: data.contact_phone || null,
                });
            }
            setLoading(false);
        };

        // Only fetch if a seemingly valid ID is provided
        if (eventId && eventId !== 'error-no-id') {
            fetchEvent();
        } else {
            setLoading(false);
            setError('Missing Event ID. Cannot fetch data.');
        }
    }, [eventId, supabase]);

    // --- Form Handlers ---
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (formData) {
            let parsedValue: string | number | null = value;

            if (type === 'number') {
                // Convert empty string to null for number fields (for optional columns)
                parsedValue = value === '' ? null : Number(value);
            }

            setFormData(prev => ({
                ...(prev as EditableEvent),
                [name]: parsedValue,
            }));
        }
    }, [formData]);

    // --- File Upload Handler (Supabase Storage) ---
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        
        // Define the path: e.g., 'event_banners/eventId/timestamp.ext'
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const filePath = `${eventId}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
            .from('event_banners') // Ensure you have a bucket named 'event_banners'
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        setIsUploading(false);

        if (uploadError) {
            console.error('Image Upload Error:', uploadError);
            setError(`Failed to upload image: ${uploadError.message}`);
            return;
        }

        if (data) {
            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('event_banners')
                .getPublicUrl(data.path);

            if (publicUrlData?.publicUrl) {
                setFormData(prev => ({
                    ...(prev as EditableEvent),
                    banner_url: publicUrlData.publicUrl,
                }));
            }
        }
    };
    
    // Handler to remove the banner URL
    const handleRemoveBanner = useCallback(() => {
        setFormData(prev => ({ ...(prev as EditableEvent), banner_url: null }));
    }, []);

    // --- 2. Supabase Update Logic ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || isSaving || isUploading) return;

        setIsSaving(true);
        setError(null);
        
        // Basic validation for required fields
        if (!formData.title || !formData.start_date) {
            setError('Title and Start Date are required.');
            setIsSaving(false);
            return;
        }

        // Prepare data for Supabase update
        const updateData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            organizer_name: formData.organizer_name,
            status: formData.status,
            
            // Dates are already in the correct timestamp format from the input
            start_date: formData.start_date,
            end_date: formData.end_date || null,

            // Optional fields
            ticket_price: formData.ticket_price,
            max_participants: formData.max_participants,
            banner_url: formData.banner_url, 
            contact_email: formData.contact_email || null,
            contact_phone: formData.contact_phone || null,
        };

        const { error: updateError } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId);
        
        setIsSaving(false);

        if (updateError) {
            console.log('Update Data Sent:', updateData);
            console.error('Update Error:', updateError.message);
            setError(`Failed to save event: ${updateError.message}`);
        } else {
            alert('Event successfully updated!');
            onEventUpdated();
        }
    };
    
    // --- Render Guards ---
    if (loading) {
        return <div className="bg-gray-800/90 p-10 rounded-xl text-white flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading event details...</div>;
    }
    
    if (!formData) {
        return (
            <div className="bg-gray-800/90 p-10 rounded-xl text-red-400">
                **Event data not found or failed to load.** <br/>
                {error} 
            </div>
        );
    }

    // --- 3. Render Form ---
    return (
        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <h2 className="text-3xl font-bold text-orange-400 mb-6 border-b border-gray-700 pb-3">
                ✏️ Edit Event Details
            </h2>
            <p className="text-gray-400 mb-4">Editing Event ID: **{eventId.substring(0, 8)}...**</p>
            
            {error && <p className="text-red-400 mb-4 bg-red-900/30 p-2 rounded">{error}</p>}
            
            <form onSubmit={handleSave} className="space-y-4">
                
                {/* Row 1: Title & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title Input (Required) */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">Event Title *</label>
                        <input
                            type="text" name="title" id="title" required
                            value={formData.title} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                    {/* Category Input */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                        <input
                            type="text" name="category" id="category"
                            value={formData.category} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                </div>

                {/* Row 2: Dates & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Start Date Input (Required) */}
                    <div >
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-300">Start Date & Time *</label>
                        <input
                            type="datetime-local" name="start_date" id="start_date" required
                            value={formData.start_date} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                    {/* End Date Input */}
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-300">End Date & Time</label>
                        <input
                            type="datetime-local" name="end_date" id="end_date"
                            value={formData.end_date || ''} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                    {/* Status Select */}
                    
                </div>

                {/* Row 3: Location & Organizer Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location Input */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
                        <input
                            type="text" name="location" id="location"
                            value={formData.location} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                    {/* Organizer Name Input */}
                    <div>
                        <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-300">Organizer Name</label>
                        <input
                            type="text" name="organizer_name" id="organizer_name"
                            value={formData.organizer_name} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                </div>

                {/* Row 4: Pricing & Participation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ticket Price Input (Numeric) */}
                    <div>
                        <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-300">Ticket Price (Numeric)</label>
                        <input
                            type="number" name="ticket_price" id="ticket_price" step="0.01"
                            value={formData.ticket_price || ''} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                            placeholder="0.00"
                        />
                    </div>
                    {/* Max Participants Input (Integer) */}
                    <div>
                        <label htmlFor="max_participants" className="block text-sm font-medium text-gray-300">Max Participants (Int)</label>
                        <input
                            type="number" name="max_participants" id="max_participants"
                            value={formData.max_participants || ''} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                            placeholder="e.g., 100"
                        />
                    </div>
                </div>

                {/* Row 5: Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Email Input */}
                    <div>
                        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-300">Contact Email</label>
                        <input
                            type="email" name="contact_email" id="contact_email"
                            value={formData.contact_email || ''} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                    {/* Contact Phone Input */}
                    <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-300">Contact Phone</label>
                        <input
                            type="text" name="contact_phone" id="contact_phone"
                            value={formData.contact_phone || ''} onChange={handleChange}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                        />
                    </div>
                </div>
                
                {/* Row 6: Banner URL & Image Upload */}
                <div className="space-y-2">
                    <label htmlFor="banner_file" className="block text-sm font-medium text-gray-300">Upload Banner Image (Max 5MB)</label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="file" 
                            id="banner_file" 
                            name="banner_file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading || isSaving}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-orange-500 file:text-white
                                hover:file:bg-orange-600"
                        />
                        {isUploading && <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />}
                    </div>

                    {/* Display current/uploaded URL or image preview */}
                    {formData.banner_url && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400 p-2 bg-gray-700 rounded-md">
                            <span className="truncate flex-1">Current Banner URL: {formData.banner_url.split('/').pop()}</span>
                            <Button 
                                type="button" 
                                size="sm" 
                                variant="destructive" 
                                onClick={handleRemoveBanner}
                                className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Description Textarea */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                        name="description" id="description" rows={4}
                        value={formData.description} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-orange-400 focus:border-orange-400"
                    />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex justify-end space-x-4">
                    <Button 
                        type="button" onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                        disabled={isSaving || isUploading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSaving || isUploading}
                        className="bg-orange-400 hover:bg-orange-500 text-gray-900 font-semibold"
                    >
                        {(isSaving || isUploading) ? (
                            <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isUploading ? 'Uploading...' : 'Saving...'}</span>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EventEditForm;