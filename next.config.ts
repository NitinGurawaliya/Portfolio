import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Strip console logs/warns in production bundles (keep errors)
    removeConsole: { exclude: ["error"] },
  },
  eslint: {
    // Disable ESLint during builds to avoid third-party package issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds if needed
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for pdfkit and font loading issues
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      
      // Externalize pdfkit to prevent bundling issues
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'canvas': 'canvas',
        });
      }
      
      // Ignore specific pdfkit font/data files
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.afm$/,
        type: 'asset/resource',
      });
    }
    
    return config;
  },
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
