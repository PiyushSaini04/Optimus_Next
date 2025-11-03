// components/RegisterOrgButton.tsx
'use client';
import Link from 'next/link';

const OrganizationBox = () => {
  // Use the new, non-legacy Link component
  return (
    <div className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">Organization Management</h2>
      <p className="mb-6 text-gray-300">
        Register your organization to host and manage events seamlessly.
      </p>
      <Link
        href="/form/organisation-register"
        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
        >
        Register Your Organization
      </Link>
    </div>
    
  );
};

export default OrganizationBox;