// /src/app/admin-dashboard/[user_id]/AdminDashboardClient.tsx
'use client';
import React, { useEffect, useState } from 'react';
import createClient from '@/api/client';
import { Calendar, Users, Briefcase, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

interface DashboardStats {
  events: number;
  registrations: number;
  organizations: number;
  recruitment: number;
}

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
  <div className={`p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-lg border-l-4 border-${color}-500 flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      <p className="text-3xl font-bold text-green-400 mt-1">{value}</p>
    </div>
    <Icon size={36} className={`text-${color}-500 opacity-70`} />
  </div>
);

export default function AdminDashboardClient() {
  const { userId } = useUser(); // <-- get userId from context
  const supabase = createClient;
  const [stats, setStats] = useState<DashboardStats>({
    events: 0,
    registrations: 0,
    organizations: 0,
    recruitment: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    setLoading(true);

    try {
      const [eventsRes, regsRes, orgRes, recRes] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('recruitment').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        events: eventsRes.count || 0,
        registrations: regsRes.count || 0,
        organizations: orgRes.count || 0,
        recruitment: recRes.count || 0
      });
    } catch (err) {
      toast.error("Failed to fetch dashboard data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();
  }, [userId]); // <-- refetch if userId changes

  return (
    <div className="space-y-8 bg-gray-900 p-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">✨ Admin Dashboard Overview</h1>
      {loading ? (
        <p className="text-center py-10 text-lg text-gray-300">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Events" value={stats.events} icon={Calendar} color="green" />
          <StatCard title="Total Registrations" value={stats.registrations} icon={Users} color="indigo" />
          <StatCard title="Organizations" value={stats.organizations} icon={Briefcase} color="purple" />
          <StatCard title="Recruitment Entries" value={stats.recruitment} icon={FileText} color="red" />
        </div>
      )}
    </div>
  );
}
