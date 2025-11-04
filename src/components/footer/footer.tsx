// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Linkedin, Instagram } from 'lucide-react'; // Assuming Lucide-react for icons

const Footer = () => {
  return (
    // Updated background to theme's primary dark mode background
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 md:px-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Column 1: Optimus Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2 text-white text-2xl font-bold">
            {/* Logo: Changed accent color from blue to the primary theme green (bg-green-600) */}
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">O</span>
            </div>
            <span>Optimus</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering the next generation of tech innovators through cutting-edge events,
            workshops, and collaborative learning experiences.
          </p>
          <div className="flex space-x-4 mt-4">
            <a 
              href="https://linkedin.com/company/optimus-student-organisation" 
              target="_blank" 
              rel="noopener noreferrer" 
              // Updated hover to theme's green accent color (text-green-500)
              className="text-gray-400 hover:text-green-500 transition duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="https://instagram.com/optimus.orgz" 
              target="_blank" 
              rel="noopener noreferrer" 
              // Updated hover to theme's green accent color (text-green-500)
              className="text-gray-400 hover:text-green-500 transition duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {/* Updated link hover to theme's green accent color */}
            <li><Link href="/" className="text-gray-400 hover:text-green-500 transition duration-200">Home</Link></li>
            <li><Link href="/event-page" className="text-gray-400 hover:text-green-500 transition duration-200">Events</Link></li>
            <li><Link href="/post" className="text-gray-400 hover:text-green-500 transition duration-200">Post</Link></li>
          </ul>
        </div>

        {/* Column 3: Community */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
          <ul className="space-y-2">
            {/* Updated link hover to theme's green accent color */}
            <li><Link href="/form/joinus" className="text-gray-400 hover:text-green-500 transition duration-200">Join Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
              <p className="text-gray-400">Block - 13, LPU Campus, Punjab, India</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <a 
                href="mailto:optimus.orgz@gmail.com" 
                // Updated link hover to theme's green accent color
                className="text-gray-400 hover:text-green-500 transition duration-200"
              >
                optimus.orgz@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom: Copyright & Legal Links */}
      {/* Note: border-gray-800 is a perfect fit for a divider on bg-gray-900 */}
      <div className="border-t border-gray-800 mt-12 pt-8 text-center md:flex md:justify-between md:items-center text-sm text-gray-500">
        <p className="mb-4 md:mb-0">&copy; 2025 Optimus Student Organisation. All rights reserved.</p>
        <div className="flex flex-wrap justify-center md:justify-end space-x-4">
          {/* Updated link hover to theme's primary text color for this section (text-white) */}
          <Link href="/privacy-policy" className="hover:text-white transition duration-200">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition duration-200">Terms of Service</Link>
          <Link href="/code-of-conduct" className="hover:text-white transition duration-200">Code of Conduct</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;