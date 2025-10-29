'use client';

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HomePage from "./home/page";
import Navbar from "@/components/navbar/page";
import Auth from "@/components/auth/Auth";

export default function Home() {
  const router = useRouter(); 
  const { user, loading } = useAuth();

  if (!loading && user) { 
    router.push("/dashboard");
    return null;
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1>Loading...</h1>
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