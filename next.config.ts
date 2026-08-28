import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.55.119.198"],
  async rewrites() {
    return [
      {
        source: "/backend/api/:path*",
        destination: "https://api.stockedup.africa/backend/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://api.stockedup.africa/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;