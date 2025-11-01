// components/RegisterOrgButton.tsx
'use client';
import Link from 'next/link';

const OrganizationBox = () => {
  // Use the new, non-legacy Link component
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Organization Management</h2>
      <p className="mb-6 text-gray-700">
        Register your organization to host and manage events seamlessly.
      </p>
      <Link
        href="/form/organisation-register"
        className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
        Register Your Organization
      </Link>
    </div>
    
  );
};

export default OrganizationBox;