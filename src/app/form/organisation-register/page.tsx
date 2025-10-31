// app/form/organisation-register/page.tsx
'use client';
import { useEffect, useState } from 'react';
import supabase from '@/api/client';
import { useRouter } from 'next/navigation';
// --- FIX: Corrected import path for the Form component ---
import RegisterOrganizationForm from '@/components/dashboard/OrganizationBox'; 

const OrganisationRegisterPage = () => {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                // Not logged in, redirect to login
                router.push('/login'); 
                return;
            }

            setUserId(session.user.id);
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    const handleSuccess = () => {
        // Redirect back to the dashboard on successful registration
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Loading user session...</p>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500">Authentication Error. Redirecting...</p>
            </div>
        );
    }

    // Centered Modal/Dialog Styling with Blurred Background
    return (
        <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
                <RegisterOrganizationForm 
                    currentUserId={userId} 
                    onSuccess={handleSuccess} 
                />
            </div>
        </div>
    );
};

export default OrganisationRegisterPage;