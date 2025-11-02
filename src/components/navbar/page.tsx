// components/Navbar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Importing the Supabase client utility correctly
import { createClient } from '@supabase/supabase-js'; // Assuming your client utility uses createClient or similar
import supabaset from '@/api/client'; // Corrected import name: supabaset
import AuthContent from '@/components/auth/Auth';
import ProfileSettingsForm from '@/components/form/profilesetting/ProfileSettingsForm';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    // ADD THESE IMPORTS:
    DialogTitle, 
    DialogHeader 
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
    { name: 'Join Us', href: 'form/joinus' },
]

const profileMenuItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '#' },
];

// --- Component ---

const Navbar: React.FC = () => {
    const router = useRouter();
    const supabase = supabaset; 
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // 1. Session Check and Listener
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setIsLoggedIn(true);
                setUserId(session.user.id); 
            } else {
                setIsLoggedIn(false);
                setUserId(null);
            }
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setIsLoggedIn(true);
                setUserId(session.user.id);
            } else {
                setIsLoggedIn(false);
                setUserId(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [supabase]);

    // 2. Logout Handler
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setIsProfileMenuOpen(false);
        setIsAuthModalOpen(false);
        setUserId(null);
        router.push('/');
    };

    // 3. Auth Success Handler
    const handleAuthSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setUserId(user.id); 
            router.push(`/dashboard/${user.id}`); 
        }
    };
    
    // 4. Settings Modal Handlers
    const handleSettingsClick = () => {
        setIsProfileMenuOpen(false); // Close the dropdown menu
        setIsSettingModalOpen(true); // Open the settings modal
    }

    const handleSettingsUpdateComplete = () => {
        // Function to call from the ProfileSettingsForm to close the modal
        setIsSettingModalOpen(false);
    };


    // Dashboard Link Generation: If userId exists, use a dynamic path.
    const dashboardHref = userId ? `/dashboard/${userId}` : '/dashboard';

    // Map profile menu items, replacing the generic Dashboard link
    const updatedProfileMenuItems = profileMenuItems.map(item => {
        if(item.name === 'Dashboard') {
            return { ...item, href: dashboardHref };
        }
        // Settings and Logout are actions, so we use href='#' but rely on conditional rendering
        return item;
    });

    return (
        <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo and App Name (omitted for brevity) */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2"> O </div>
                        <span className="text-white text-xl font-semibold tracking-wider"> Optimus </span>
                    </div>

                    <div className="flex items-center space-x-4">

                        {/* Desktop Navigation Links - Modern Link Usage (No <a> tag needed) */}
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

                        {/* Search Button (omitted for brevity) */}
                        <button className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition duration-150 ease-in-out">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Authentication (Sign In Button or Profile Menu) */}
                        {!isLoggedIn ? (
                            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-150 ease-in-out text-sm">
                                        Sign In
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                                    {/* 🔑 FIX for Accessibility: Add DialogTitle. We use DialogHeader and a hidden title for clean integration. */}
                                    <DialogHeader className="sr-only">
                                        <DialogTitle>Authentication</DialogTitle>
                                    </DialogHeader>
                                    
                                    <AuthContent onSuccess={handleAuthSuccess} />
                                </DialogContent>
                            </Dialog>

                        ) : (
                            // Profile Menu when logged in
                            <div className="relative">
                                {/* Profile Picture Button (omitted for brevity) */}
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white p-0.5"
                                    aria-expanded={isProfileMenuOpen}
                                    aria-haspopup="true"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img className="h-8 w-8 rounded-full bg-gray-600 border-2 border-white" src="https://via.placeholder.com/150/007bff/ffffff?text=U" alt="User Profile" />
                                    <svg className={`ml-1 h-4 w-4 text-white transform ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        tabIndex={-1}
                                    >
                                        {updatedProfileMenuItems.map((item) => {
                                            const className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-100";
                                            const isAction = item.name === 'Logout' || item.name === 'Settings';

                                            // 🌟 FIX: Render action items as divs with onClick, and navigation items as modern Link
                                            if (isAction) {
                                                const handleClick = item.name === 'Logout' ? handleLogout : handleSettingsClick;
                                                return (
                                                    <div
                                                        key={item.name}
                                                        onClick={handleClick}
                                                        className={`${className} cursor-pointer`}
                                                        role="menuitem"
                                                        tabIndex={-1}
                                                    >
                                                        {item.name}
                                                    </div>
                                                );
                                            } 
                                            
                                            // Render Dashboard link (navigation) using the modern <Link> structure
                                            return (
                                                <Link 
                                                    key={item.name} 
                                                    href={item.href} 
                                                    className={className} 
                                                    role="menuitem"
                                                    tabIndex={-1}
                                                    onClick={() => setIsProfileMenuOpen(false)} // Close menu on navigation
                                                >
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Profile Settings Dialog --- */}
            {userId && (
                <Dialog 
                    open={isSettingModalOpen}
                    onOpenChange={setIsSettingModalOpen}
                >
                    <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                        {/* 🔑 FIX for Accessibility: Add DialogTitle and DialogHeader. */}
                        <DialogHeader className="p-4 bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</DialogTitle>
                        </DialogHeader>
                        
                        {/* Note: ProfileSettingsForm content should be adjusted to not duplicate this title */}
                        <ProfileSettingsForm 
                            userId={userId} 
                            onUpdateComplete={handleSettingsUpdateComplete}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </nav>
    );
};

export default Navbar;