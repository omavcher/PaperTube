import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress all responses
  compress: true,

  // Optimize heavy icon package imports — only bundle what's actually used
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "lucide-react",
      "react-icons",
      "framer-motion",
    ],
  },

  images: {
    // Serve modern image formats (AVIF/WebP) — much smaller than JPEG/PNG
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Cache optimized images longer
    minimumCacheTTL: 86400,
    // Only generate needed sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Keep Webpack fallback for standard builds
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        encoding: false,
      };
    }

    // Production chunk splitting — separates heavy libraries into cacheable chunks
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Separate framer-motion so it's only loaded where needed
            framerMotion: {
              name: "framer-motion",
              test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
              chunks: "all",
              priority: 30,
            },
            // Separate Radix UI components
            radix: {
              name: "radix-ui",
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: "all",
              priority: 20,
            },
            // All other vendor code
            vendor: {
              name: "vendors",
              test: /[\\/]node_modules[\\/]/,
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;