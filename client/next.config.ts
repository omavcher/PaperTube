import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "api.microlink.io", // Microlink Image Preview
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows all HTTPS image domains
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevent ESLint errors from blocking builds
  },
  // --- ADD THIS WEBPACK CONFIGURATION ---
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `canvas` or other node modules
      config.resolve.alias.canvas = false;
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;