// /src/app/admin-dashboard/[user_id]/page.tsx
'use client';

import AdminDashboardClient from './AdminDashboardClient';

export default function AdminDashboardPage() {
  // No need to fetch userId here; layout handles auth & admin check
  return <AdminDashboardClient />;
}
