import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  // Tree-shake large icon/animation libraries — only bundle what's actually used.
  // This cuts 100-400KB from the initial JS parse on desktop.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@tabler/icons-react",
      "react-icons",
    ],
  },

  // Compress all assets with Gzip/Brotli
  compress: true,

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Use modern WebP/AVIF format for faster image loads
    formats: ["image/avif", "image/webp"],
  },

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