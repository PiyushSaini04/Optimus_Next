// /src/app/admin-dashboard/[user_id]/page.tsx

// NO 'use client' directive here
// NOTE: Make sure your createClient utility is a function that returns the client instance.
import createClient from '@/api/client'; 
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

// Corrected TypeScript Interface for the component props
interface AdminDashboardPageProps {
  params: { user_id: string };
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
    // ⚠️ CRITICAL FIX: The imported client is a function, it must be called.
    

    // 4. If the role check passes, render the client dashboard
    // FIX: Pass the targetUserId to the client component
    return <AdminDashboardClient  />;
}