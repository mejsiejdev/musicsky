import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
        port: "",
        pathname: "/img/avatar/plain/**",
      },
    ],
  },
};

export default nextConfig;
