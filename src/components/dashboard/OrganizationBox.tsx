// components/RegisterOrgButton.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/api/client';  // adjust your path if different

const OrganizationBox = () => {
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('uuid', user.id)
        .single();

      setProfile(profileData);

      // If organisation exists, fetch its details
      if (profileData?.organisation_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name, description, status')
          .eq('id', profileData.organisation_id)
          .single();

        setOrganization(orgData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">
        Organization Management
      </h2>

      {/* Case 1: No organization → show register button */}
      {!profile?.organisation_id ? (
        <>
          <p className="mb-6 text-gray-300">
            You haven't registered an organization yet.
          </p>
          <Link
            href="/form/organisation-register"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
          >
            Register Your Organization
          </Link>
        </>
      ) : (
        /* Case 2: Organization exists → show details */
        <div className='flex'>

        <div className="text-gray-300">
          <p className="text-2xl font-bold text-green-400">{organization?.name}</p>
          <p className="mt-2">{organization?.description || 'No description available'}</p>

        </div>
        <div className="ml-auto text-right border-l border-gray-700 pl-4">
          <p className="mt-4">
            <span className="font-semibold">Status:</span>{' '}
            {organization?.status === 'approved' ? (
              <span className="text-green-400">Approved</span>
            ) : organization?.status === 'pending' ? (
              <span className="text-yellow-400">Pending Approval</span>
            ) : (
              <span className="text-red-400">Rejected</span>
            )}
          </p>
        </div>
      </div>
        
      )}
    </div>
  );
};

export default OrganizationBox;
