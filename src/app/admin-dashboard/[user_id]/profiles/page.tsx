'use client';
import { useState, useEffect } from 'react';
import createClient from '@/api/client';
import DataTable from '@/components/admin-dashboard/DataTable';
import ExportButton from '@/components/admin-dashboard/ExportButton';
import ProfileForm from '@/components/admin-dashboard/ProfileForm';
import Modal from '@/components/ui/Modal';
import { Profile } from '@/lib/types/supabase';

// ✅ 1. Extend Profile with organization name
type ProfileWithOrg = Profile & {
  organizations: { name: string } | null;
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileWithOrg[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithOrg | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ✅ 2. Call the Supabase client function properly
  const supabase = createClient;

  // ✅ 3. Fetch profiles with organizations
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, organizations(name)`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as ProfileWithOrg[]);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // ✅ Edit handler
  const handleOpenEdit = (profile: ProfileWithOrg) => {
    setSelectedProfile(profile);
    setIsFormOpen(true);
  };

  // ✅ Delete handler (string | number accepted)
  const handleDelete = async (id: string | number) => {
    const profileUuid = String(id);
    if (!confirm('Are you sure you want to DELETE this user profile?')) return;

    const { error } = await supabase.from('profiles').delete().eq('uuid', profileUuid);
    if (!error) fetchProfiles();
  };

  const handleFormSuccess = () => {
    alert('Profile successfully updated.');
    setIsFormOpen(false);
    fetchProfiles();
  };

  const columns = [
    { header: 'UUID', accessorKey: 'uuid', render: (id: string) => `${id.substring(0, 6)}...` },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Name', accessorKey: 'name', render: (val: string) => val || 'N/A' },
    { header: 'Role', accessorKey: 'role_type' },
    { header: 'Organization', accessorKey: 'organizations', render: (org: any) => org?.name || 'None' },
    { header: 'Joined At', accessorKey: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold lowercase text-white">🧑‍💻 User Profiles Management</h1>

      <div className="flex justify-end items-center">
        <ExportButton data={profiles} filename="profiles_data" />
      </div>

      {/* ✅ Use ProfileWithOrg instead of Profile */}
      <DataTable<ProfileWithOrg>
        data={profiles}
        columns={columns}
        tableName="profiles"
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
      />

      {isFormOpen && selectedProfile && (
        <Modal onClose={() => setIsFormOpen(false)}>
          <ProfileForm
            table="profiles"
            initialData={selectedProfile}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
