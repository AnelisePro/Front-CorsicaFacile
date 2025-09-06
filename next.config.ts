import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'front-corsica-facile.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'corsica-facile-dev.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'corsica-facile-prod.s3.eu-north-1.amazonaws.com',
      }
    ],
  },
};

export default nextConfig;

