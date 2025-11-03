// components/BottomNavbar.tsx
"use client";

import Link from 'next/link';
// CORRECTED: Use usePathname instead of useRouter for the current URL path in App Router
import { usePathname } from 'next/navigation'; 
import React from 'react';

// --- Types and Data ---

interface NavItem {
    name: string;
    href: string;
    icon?: React.ReactNode; 
}

interface BottomNavbarProps {
    // Nav items are defined directly in this component to strictly control the mobile links
}

// Mobile Nav Icons and Data
const mobileNavItems: NavItem[] = [
    { 
        name: 'Home', 
        href: '/', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ) 
    },
    { 
        name: 'Events', 
        href: '/event-page', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ) 
    },
    { 
        name: 'Post', 
        href: '/post', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    { 
        name: 'Join Us', 
        href: '/form/joinus', // Ensure consistent leading slash
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-1-10v-3m0 3h-3m0 0h3m0 0v3m0-3h3m-3 0v3m0-3h3" />
            </svg>
        )
    },
]

// --- Component ---

const BottomNavbar: React.FC<BottomNavbarProps> = () => {
    // CORRECTED: Use usePathname for the current path
    const currentPath = usePathname(); 

    // The logic is now correct using currentPath
    const isActive = (href: string) => {
        // If href is the root, match strictly
        if (href === '/') return currentPath === href;
        // For other paths, match if the current path starts with the href
        return currentPath.startsWith(href);
    }
    
    return (
        // Only visible below md breakpoint, fixed to the bottom
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900 border-t border-gray-700 shadow-xl">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {/* Map over the strictly defined mobile nav items */}
                {mobileNavItems.map((item) => {
                    const active = isActive(item.href);
                    const className = `flex flex-col items-center justify-center p-2 text-xs font-medium transition duration-150 ease-in-out ${
                        active ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                    }`;
                    
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className={className}
                        >
                            {item.icon}
                            <span className="mt-1">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
};

export default BottomNavbar;