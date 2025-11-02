import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oadgoeozgczzprdtuylo.supabase.co',
        // Optional: If you want to be more specific, you can add port and pathname
        // port: '',
        // pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
    // If you are using an older Next.js version (before 13.3) use the domains array:
    // domains: ['oadgoeozgczzprdtuylo.supabase.co'],
  },
};

export default nextConfig;
