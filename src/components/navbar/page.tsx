import React, { useState } from 'react';
import Link from 'next/link';
// Assuming you move AuthContent to a new location or rename the import
import AuthContent from '@/components/auth/Auth'; 
// Import the new Modal component
import { 
    Dialog, 
    DialogTrigger, 
    DialogContent 
} from '@/components/ui/dialog';

interface NavItem {
    name: string;
    href: string;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Post', href: '/post' },
    { name: 'Join Us', href: '/join-us' },
];

const profileMenuItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
    { name: 'Logout', href: '#' },
];

const Navbar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    
    // 🔑 We'll keep this state, but it will be passed to onOpenChange
    // The name 'isAuthDialogOpen' is clearer, but 'isAuthModalOpen' works too.
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 

    const handleLogout = () => {
        console.log("User logged out!");
        setIsLoggedIn(false);
        setIsProfileMenuOpen(false);
    };
    
    // 🔑 Function to run on successful Login/Signup
    const handleAuthSuccess = () => {
        setIsLoggedIn(true); // Assuming successful auth means the user is now logged in
        setIsAuthModalOpen(false); // Close the modal
    };

    return (
        // Remove the outer React.Fragment (<>) since you are wrapping everything in <nav> now
        // And we will move the Dialog component *inside* the <nav> structure where the button is.

        <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2">
                            O
                        </div>
                        <span className="text-white text-xl font-semibold tracking-wider">
                            Optimus
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => (
                                <Link key={item.name} href={item.href} legacyBehavior>
                                    <a className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                        {item.name}
                                    </a>
                                </Link>
                            ))}
                        </div>

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

                        {!isLoggedIn ? (
                            // 🚀 CORRECT IMPLEMENTATION:
                            // The entire Dialog structure replaces the old "Sign In" button
                            <Dialog 
                                // 1. Uses 'open' for the state variable
                                open={isAuthModalOpen} 
                                // 2. Uses 'onOpenChange' for the setter function
                                onOpenChange={setIsAuthModalOpen}
                            >
                                {/* 3. DialogTrigger WRAPS the button */}
                                <DialogTrigger asChild>
                                    <button
                                        // No onClick needed here, DialogTrigger handles it
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-150 ease-in-out text-sm"
                                    >
                                        Sign In
                                    </button>
                                </DialogTrigger>

                                {/* 4. DialogContent holds the actual content */}
                                <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
                                    <AuthContent onSuccess={handleAuthSuccess} />
                                </DialogContent>
                            </Dialog>

                        ) : ( 
                            <div className="relative">
                                {/* ... (Existing Profile Menu Logic) ... */}
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
                                
                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        tabIndex={-1}
                                    >
                                        {profileMenuItems.map((item) => (
                                            <Link key={item.name} href={item.href} legacyBehavior>
                                                <a
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