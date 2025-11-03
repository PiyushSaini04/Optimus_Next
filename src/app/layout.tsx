// app/layout.tsx (or equivalent file)
'use client';
import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
// import Navbar from "@/components/navbar/page"; // <-- Remove the direct import
import React from 'react';
import { Toaster } from 'sonner';
import BottomNavbar from "@/components/navbar/bottomNavbar";
import dynamic from 'next/dynamic'; // <-- Import dynamic

// 1. Dynamically import the Navbar with SSR disabled
const DynamicNavbar = dynamic(() => import('@/components/navbar/page'), {
  // IMPORTANT: This prevents the component from being rendered on the server
  ssr: false, 
  // Optional: Display something simple while the Navbar loads client-side
  loading: () => <div style={{ height: '64px', backgroundColor: '#1f2937' }}></div>, 
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      {/* ... head elements ... */}
      <body className="bg-gray-900 text-white font-sans">
        <AuthProvider> 
          {/* 2. Use the dynamic import */}
          <DynamicNavbar />
          {children}
          <BottomNavbar />
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}