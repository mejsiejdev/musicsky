import type { NextConfig } from "next";

const appviewUrl =
  process.env.NEXT_PUBLIC_APPVIEW_URL ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  reactCompiler: true,
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
  images: {
    remotePatterns: [
      new URL(`${appviewUrl}/blob/**`),
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
