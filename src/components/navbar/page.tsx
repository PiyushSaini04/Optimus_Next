import React from 'react';
import Link from 'next/link';

// Define the structure for each navigation item
interface NavItem {
  name: string;
  href: string;
}

// Define the static list of navigation links
const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Post', href: '/post' },
  { name: 'Join Us', href: '/join-us' },
];

const Navbar: React.FC = () => {
  return (
    // Outer container: dark background, fixed padding, and flex layout
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. App Logo and Name */}
          <div className="flex items-center">
            {/* Logo Icon (Blue Circle) */}
            <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg mr-2">
              O
            </div>
            {/* App Name */}
            <span className="text-white text-xl font-semibold tracking-wider">
              Optimus
            </span>
          </div>

          {/* 2. Navigation Links, Search, and Sign In */}
          <div className="flex items-center space-x-4">
            
            {/* Nav Links */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} legacyBehavior>
                  <a className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>

            {/* Search Icon */}
            <button className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition duration-150 ease-in-out">
              {/* SVG for Magnifying Glass (Search Icon) */}
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

            {/* Sign In Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out shadow-md">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;