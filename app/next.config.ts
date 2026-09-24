import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "prestocks.com",
      },
      {
        protocol: "https",
        hostname: "www.prestocks.com",
      },
    ],
  },
};

export default nextConfig;
