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
  // Stub unused Solana modules pulled in transitively by @coinbase/cdp-sdk
  turbopack: {
    resolveAlias: {
      "@solana/kit": "./src/stubs/empty.js",
      "@solana-program/system": "./src/stubs/empty.js",
      "@solana-program/token": "./src/stubs/empty.js",
    },
  },
  // Webpack fallback for non-turbopack builds
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/kit": false,
      "@solana-program/system": false,
      "@solana-program/token": false,
    };
    return config;
  },
};

export default nextConfig;
