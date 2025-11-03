// /src/app/dashboard/layout.tsx
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin-dashboard/sidebar';
import { Menu } from 'lucide-react';
import createClient from '@/api/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserProvider } from '@/context/UserContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('You must be logged in to access this page');
        router.push('/');
        return;
      }

      const currentUserId = session.user.id;

      // Check if admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role_type')
        .eq('uuid', currentUserId)
        .single();

      if (error || !profile || profile.role_type !== 'admin') {
        toast.error('You do not have admin privileges');
        router.push('/');
        return;
      }

      setUserId(currentUserId);
      setLoading(false);
    };

    fetchUser();
  }, [router, supabase]);

  if (loading) return <p className="text-center text-gray-300 py-10">Loading...</p>;
  if (!userId) return null;

  return (
    <UserProvider value={{ userId }}>
      <div className="flex h-screen bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} userId={userId} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center p-4 bg-gray-800 border-b border-gray-700 shadow-md md:hidden">
            <button onClick={toggleSidebar} className="text-gray-300 mr-4">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
