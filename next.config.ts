import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ui-avatars.com',
      'localhost',
      'front-corsica-facile.vercel.app',
      'corsica-facile-dev.s3.eu-north-1.amazonaws.com',
      'corsica-facile-prod.s3.eu-north-1.amazonaws.com'
    ],
  },
};

export default nextConfig;

