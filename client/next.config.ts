import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Sometimes WorkerErrors are triggered by heavy type checking on low-memory build machines
    ignoreBuildErrors: true, 
  },
  // 1. Configure Turbopack aliases
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: false,
      },
    },
  },
  // 2. Preserve Webpack fallback for standard builds
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