'use client';

import React from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import HomePage from "./home/page"; 
import Navbar from "@/components/navbar/page";

export default function Home() {
  
    const router = useRouter(); 
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
            </div>
        );
    }

    return (
        <>
            <Navbar/>
            
            <HomePage />
            
            
        </>
    );
}