'use client';
import "./globals.css";
import { AuthProvider } from "@/components/context/authprovider";
import React from 'react';
import { Toaster } from 'sonner';

// Define the type for the component's props
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> 
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}