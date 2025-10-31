// app/dashboard/layout.tsx
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Removed fixed sidebar margin. Content now spans full width.
        <div className="min-h-screen bg-gray-50">
            <main>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;