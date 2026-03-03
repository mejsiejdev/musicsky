import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
        port: "",
        pathname: "/img/avatar/plain/**",
      },
      {
        protocol: "https",
        hostname: "*.bsky.network",
      },
    ],
  },
};

export default nextConfig;
