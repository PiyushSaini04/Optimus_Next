'use client';
import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
import Navbar from "@/components/navbar/page";
import React from 'react';
import { Toaster } from 'sonner';

// Define the type for the component's props
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-900 text-white font-sans">
        <AuthProvider> 
          <Navbar />
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}