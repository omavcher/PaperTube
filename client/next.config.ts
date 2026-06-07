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

  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      encoding: false,
    };

    if (!dev && !isServer) {
      // In production, enable deterministic chunk IDs for better long-term caching
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        chunkIds: "deterministic",
      };
    }

    return config;
  },

  // Avoid full-page reload on 404 (use soft navigation)
  skipTrailingSlashRedirect: true,

  // Custom headers to allow Googlebot, Bingbot, and all automated tools
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
    ];
  },
};

export default nextConfig;