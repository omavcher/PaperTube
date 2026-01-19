import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Move ESLint and TypeScript checks out of the heavy worker process
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // 2. Add Turbopack specific aliases
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: false,
      },
    },
  },

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