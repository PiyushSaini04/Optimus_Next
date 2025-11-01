"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Importing the Supabase client utility correctly
import { createClient } from '@supabase/supabase-js'; // Assuming your client utility uses createClient or similar
import supabaset from '@/api/client'; // Corrected import name: supabaset
import AuthContent from '@/components/auth/Auth';
import {
    Dialog,
    DialogTrigger,
    DialogContent
} from '@/components/ui/dialog';

// --- Types and Data ---

interface NavItem {
    name: string;
    href: string;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/event-page' },
    { name: 'Post', href: '/post' },
    { name: 'Join Us', href: '/join-us' },
];

const profileMenuItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '#' },
];

// --- Component ---

const Navbar: React.FC = () => {
    const router = useRouter();
    
    // 🔑 CORRECTION 1: Use the imported client utility, and rename it to 'supabase' for clarity
    // or use the original 'supabaset' consistently. We'll use 'supabase' for the rest of the logic.
    const supabase = supabaset; 
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    // User ID will hold the Supabase Auth UUID (auth.users table)
    const [userId, setUserId] = useState<string | null>(null);

    // 1. Check for an existing session on mount (Automatic Login)
    // 🔑 CORRECTION 2: The 'supabase' object is now stable because it's imported once as a constant.
    // It should still be in the dependency array to satisfy ESLint, but because it's a stable client instance, 
    // the effect only runs on mount.
    useEffect(() => {
        // Function to check the current session
        const checkSession = async () => {
            // Get the session from local storage/cookies managed by Supabase
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // User is logged in
                setIsLoggedIn(true);
                // Set the UUID from the Supabase auth user object
                setUserId(session.user.id); 
                console.log("User logged in automatically. ID:", session.user.id);
            } else {
                // No active session
                setIsLoggedIn(false);
                setUserId(null);
            }
        };

        checkSession();

        // Optional: Listen for auth state changes (e.g., from another tab)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setIsLoggedIn(true);
                setUserId(session.user.id);
            } else {
                setIsLoggedIn(false);
                setUserId(null);
            }
        });

        // Cleanup the listener on component unmount
        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [supabase]); // Keep dependency for correctness and ESLint, though it's a stable object

    // 🔑 CORRECTION 3: The `handleLogout` function also depends on the `supabase` object.
    const handleLogout = async () => {
        console.log("Attempting user logout...");
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Logout error:", error);
            // Even if Supabase call fails, clear client state for a responsive UI
        }

        // Clear client state
        setIsLoggedIn(false);
        setIsProfileMenuOpen(false);
        setIsAuthModalOpen(false);
        setUserId(null);

        // Redirect to home page on logout
        router.push('/');
    };

    // 🔑 CORRECTION 4: The `handleAuthSuccess` function also depends on the `supabase` object.
    const handleAuthSuccess = async () => {
        // After AuthContent successfully signs in, we fetch the current user's details
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error fetching user after successful login:", error);
            return;
        }

        if (user) {
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            // 🔑 Set the userId from the authenticated Supabase user object
            setUserId(user.id); 
            console.log("Auth success. User ID set:", user.id);
            
            // NAVIGATION: Redirect the user to their dashboard or home
            router.push(`/dashboard/${user.id}`); 
        }
    };

    // Dashboard Link Generation: If userId exists, use a dynamic path.
    // This directs to a user-specific dashboard page, e.g., /dashboard/user_12345
    const dashboardHref = userId ? `/dashboard/${userId}` : '/dashboard';

    // Map profile menu items, replacing the generic Dashboard link
    const updatedProfileMenuItems = profileMenuItems.map(item =>
        item.name === 'Dashboard' ? { ...item, href: dashboardHref } : item
    );

    return (
        <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo and App Name */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2">
                            O
                        </div>
                        <span className="text-white text-xl font-semibold tracking-wider">
                            Optimus
                        </span>
                    </div>

                    {/* Navigation Links and Action Buttons */}
                    <div className="flex items-center space-x-4">

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => (
                               <Link 
                                    key={item.name} 
                                    href={item.href} 
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                                    >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Search Button (Example) */}
                        <button className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition duration-150 ease-in-out">
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Authentication (Sign In Button or Profile Menu) */}
                        {!isLoggedIn ? (
                            // Sign In button wrapped in Dialog component
                            <Dialog
                                open={isAuthModalOpen}
                                onOpenChange={setIsAuthModalOpen}
                            >
                                {/* Button to open the dialog/modal */}
                                <DialogTrigger asChild>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-150 ease-in-out text-sm"
                                    >
                                        Sign In
                                    </button>
                                </DialogTrigger>

                                {/* Modal content - Auth form */}
                                <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                                    {/* Pass the success handler to the Auth component */}
                                    <AuthContent onSuccess={handleAuthSuccess} />
                                </DialogContent>
                            </Dialog>

                        ) : (
                            // Profile Menu when logged in
                            <div className="relative">
                                {/* Profile Picture Button */}
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white p-0.5"
                                    aria-expanded={isProfileMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="h-8 w-8 rounded-full bg-gray-600 border-2 border-white"
                                        src="https://via.placeholder.com/150/007bff/ffffff?text=U"
                                        alt="User Profile"
                                    />
                                    <svg className={`ml-1 h-4 w-4 text-white transform ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        tabIndex={-1}
                                    >
                                        {/* Use the updated list for the dashboard link */}
                                        {updatedProfileMenuItems.map((item) => (
                                            <Link key={item.name} href={item.href}>
                                                <a
                                                    // Only handle Logout with a special function
                                                    onClick={item.name === 'Logout' ? handleLogout : () => setIsProfileMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-100"
                                                    role="menuitem"
                                                    tabIndex={-1}
                                                >
                                                    {item.name}
                                                </a>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;