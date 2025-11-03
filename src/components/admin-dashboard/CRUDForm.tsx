// /src/components/dashboard/CRUDForm.tsx
'use client';
import { useState, useEffect } from 'react';
// FIX: Import the named function and use the correct path
import createClient from '@/api/client';
// Import the types we defined
import { CRUDFormProps, FormField } from '@/lib/types/form'; 
import { Organization } from '@/lib/types/supabase'; // Example of a generic constraint

// Use a generic type T, constrained to ensure it has an 'id'
export default function CRUDForm<T extends { id: string | number } | Organization>({ 
    table, 
    initialData, 
    onSuccess, 
    onCancel, 
    fields 
}: CRUDFormProps<T>) { // <-- Props are fully typed
    
    // Use Record<string, any> for formData since the structure is dynamic
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    
    // FIX: Call the client creation function
    const supabase = createClient;
    
    const isEditing = !!initialData;
    
    // Initialize form data when component mounts or initialData changes
    useEffect(() => {
        // Use the initialData (T) for initialization
        setFormData(initialData || {}); 
    }, [initialData]);

    // FIX: Explicitly type the event 'e'
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Destructure the properties that exist on ALL possible targets
        const { name, value, type } = e.target; 
        
        // Initialize checked property safely (defaults to undefined for non-checkboxes)
        let checked: boolean | undefined;

        // Use type narrowing to safely access the 'checked' property
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => ({
            ...prev,
            // Use the checked value if it exists (i.e., it's a checkbox)
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => { // <-- Explicitly type the form event
        e.preventDefault();
        setLoading(true);

        const dataToSubmit = { ...formData };
        
        let supabaseResponse;
        if (isEditing) {
            // **UPDATE Logic**
            // The 'id' property is guaranteed by the generic constraint <T>
            supabaseResponse = await supabase
                .from(table)
                .update(dataToSubmit)
                .eq('id', initialData!.id); // Use non-null assertion if editing
        } else {
            // **INSERT Logic**
            supabaseResponse = await supabase
                .from(table)
                .insert([dataToSubmit]);
        }

        setLoading(false);
        if (supabaseResponse.error) {
            console.error('Submission Error:', supabaseResponse.error);
            alert(`Error: ${supabaseResponse.error.message}`);
        } else {
            onSuccess(isEditing ? 'updated' : 'inserted');
        }
    };

    return (
        <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">
                {isEditing ? `Edit ${table}` : `Add New ${table}`}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {fields.map((field: FormField) => ( // <-- Typed map parameter
                    <div key={field.name} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-300">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {/* Render different input types */}
                        {field.type === 'textarea' ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''} // <-- Now type-safe because formData is Record<string, any>
                                onChange={handleChange}
                                rows={3}
                                required={field.required}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm p-2 text-white"
                            />
                        ) : field.type === 'select' ? (
                            <select
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm p-2 text-white"
                            >
                                <option value="">Select a value</option>
                                {field.options && field.options.map(opt => ( // <-- Conditional check and typed map
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm p-2 text-white"
                            />
                        )}
                    </div>
                ))}

                <div className="col-span-2 flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white font-bold rounded-md shadow-md hover:bg-green-700 disabled:bg-green-400">
                        {loading ? 'Saving...' : (isEditing ? 'Update Record' : 'Create Record')}
                    </button>
                </div>
            </form>
        </div>
    );
}