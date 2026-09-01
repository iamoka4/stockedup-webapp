import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.55.119.198"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/.well-known/assetlinks.json",
          destination: "/api/assetlinks",
        },
      ],
      afterFiles: [
        {
          source: "/backend/api/:path*",
          destination: "https://stockedup.africa/backend/api/:path*",
        },
        {
          source: "/uploads/:path*",
          destination: "https://stockedup.africa/uploads/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
