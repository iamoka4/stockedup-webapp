import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.55.119.198"],
  async rewrites() {
    return [
      {
        source: "/backend/api/:path*",
        destination: "https://api.stockedup.africa/backend/api/:path*",
      },
    ];
  },
};

export default nextConfig;