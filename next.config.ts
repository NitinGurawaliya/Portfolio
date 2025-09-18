import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to avoid third-party package issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds if needed
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
