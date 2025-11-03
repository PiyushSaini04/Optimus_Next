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
import Logo from '../../../public/optimuslogo.png';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader
} from '@/components/ui/dialog';
import { set } from 'date-fns';

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

// The base profile menu items
const baseProfileMenuItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '#' },
];

// New item for Admin Dashboard
const adminDashboardItem: NavItem = { name: 'Admin Dashboard', href: '/admin-dashboard/${userId}' };



// --- Component ---

const Navbar: React.FC = () => {
    const router = useRouter();
    const supabase = supabaset;            
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null); 
    // components/Navbar.tsx (Inside Navbar component)
    const [avatarUrl, setAvatarUrl] = useState<string>('https://via.placeholder.com/150/007bff/ffffff?text=U');

    // Helper function to fetch user profile role (Corrected for role_type)
    const fetchUserProfile = async (id: string) => { // Renamed from fetchUserRole for clarity
        const { data, error } = await supabase
            .from('profiles')
            // FIX: Combine both fields into a single .select() string
            .select('role_type, avatar_url') 
            // NOTE: I'm using 'avatar_url' (snake_case) as is common in Supabase, 
            // please verify if your column is actually named 'avtar_url' or 'avatar_url'.
            .eq('uuid', id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error); 
            // Return a structured object with nulls/defaults on error
            return { 
                role: null, 
                avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=U' 
            };
        }

        // FIX: Return an object containing both values
        return { 
            role: data?.role_type || null, 
            avatar: data?.avatar_url || 'https://via.placeholder.com/150/007bff/ffffff?text=U' 
        }; 
    }

    // 1. Session Check and Listener
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const id = session.user.id;
                setIsLoggedIn(true);
                setUserId(id); 
                const role = await fetchUserProfile(id);
                setUserRole(role.role);
                setAvatarUrl(role.avatar); // Set avatar URL from profile data
            } else {
                setIsLoggedIn(false);
                setUserId(null);
                setUserRole(null); 
            }
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const id = session.user.id;
                setIsLoggedIn(true);
                setUserId(id);
                fetchUserProfile(id).then(role => {
                    setUserRole(role.role);
                    setAvatarUrl(role.avatar); // Set avatar URL from profile data
                });
            } else {
                setIsLoggedIn(false);
                setUserId(null);
                setUserRole(null); 
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
        setUserRole(null); 
        router.push('/');
    };

    // 3. Auth Success Handler
    const handleAuthSuccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setUserId(user.id); 
            
            const role = await fetchUserProfile(user.id);
            setUserRole(role.role);
            setAvatarUrl(role.avatar); // Set avatar URL from profile data

            router.push(`/dashboard/${user.id}`); 
        }
    };
    
    // 4. Settings Modal Handlers
    const handleSettingsClick = () => {
        setIsProfileMenuOpen(false); 
        setIsSettingModalOpen(true); 
    }

    const handleSettingsUpdateComplete = () => {
        setIsSettingModalOpen(false);
    };


    // Dashboard Link Generation: If userId exists, use a dynamic path.
    const dashboardHref = userId ? `/dashboard/${userId}` : '/dashboard';

    // 🌟 CONDITIONAL MENU CREATION LOGIC (Role is 'admin')
    let updatedProfileMenuItems = [...baseProfileMenuItems];

    // Check if the user is an 'admin' and add the Admin Dashboard
    if (userRole === 'admin') { // <-- Role changed to 'admin'
        updatedProfileMenuItems.unshift(adminDashboardItem); 
    }

    // Map profile menu items, replacing the generic Dashboard link
    updatedProfileMenuItems = updatedProfileMenuItems.map(item => {
        if(item.name === 'Dashboard') {
            return { ...item, href: dashboardHref };
        }
        return item;
    });

    return (
        <nav className="bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-700">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo and App Name (omitted for brevity) */}
                    <div className="flex items-center">
                        {/* <div className="flex-shrink-0 bg-green-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2"> O </div>
                        <span className="text-white text-xl font-semibold tracking-wider"> Optimus </span> */}

                        <img src={Logo.src} alt="Optimus Logo" style={{ width: 'auto', height: '60px' }} />
                    </div>

                    <div className="flex-1 flex justify-center">

                        {/* Desktop Navigation Links - Modern Link Usage (No <a> tag needed) */}
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => (
                               <Link 
                                    key={item.name} 
                                    href={item.href} 
                                    className="text-gray-300 hover:bg-gray-800 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                                    >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        </div>
                    <div className="flex items-center space-x-4">

                        {/* Search Button (omitted for brevity) */}
                        

                        {/* {userRole === 'admin' && userId && (
                            <button
                                onClick={() => router.push(`/admin-dashboard/${userId}`)}
                                className="ml-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-150 ease-in-out text-sm"
                            >
                                Admin Dashboard
                            </button>
                        )} */}


                        {/* Authentication (Sign In Button or Profile Menu) */}
                        {!isLoggedIn ? (
                            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded-lg transition duration-150 ease-in-out text-sm">
                                        Sign In
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
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
                                    <img className="h-8 w-8 rounded-full bg-gray-600 border-2 border-white" src={avatarUrl} alt="User Profile" />
                                    <svg className={`ml-1 h-4 w-4 text-white transform ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        tabIndex={-1}
                                    >
                                        {updatedProfileMenuItems.map((item) => {
                                            const className = "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400 transition duration-100";
                                            const isAction = item.name === 'Logout' || item.name === 'Settings';

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
                                            
                                            return (
                                                <Link 
                                                    key={item.name} 
                                                    href={item.href} 
                                                    className={className} 
                                                    role="menuitem"
                                                    tabIndex={-1}
                                                    onClick={() => setIsProfileMenuOpen(false)} 
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
                        <DialogHeader className="p-4 bg-gray-800 rounded-t-lg border-b border-gray-700">
                            <DialogTitle className="text-xl font-bold text-green-400">Profile Settings</DialogTitle>
                        </DialogHeader>
                        
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