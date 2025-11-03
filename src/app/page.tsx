'use client';

import React from "react";
import { useAuth } from "@/components/context/authprovider";
import { useRouter } from "next/navigation";
import HomePage from "./home/page"; 

export default function Home() {
  
    const router = useRouter(); 
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <h1 className="text-2xl font-bold text-white">Loading...</h1>
            </div>
        );
    }

    return (
        <>    
            <HomePage />  
        </>
    );
}