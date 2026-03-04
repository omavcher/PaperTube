import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Removed eslint and typescript override since they cause type errors
  
  // 2. Removed empty turbo config

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // 2. Removed Turbopack specific aliases

  // 3. Keep Webpack fallback for standard builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
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