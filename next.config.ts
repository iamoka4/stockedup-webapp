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
          destination: "https://api.stockedup.africa/backend/api/:path*",
        },
        {
          source: "/uploads/:path*",
          destination: "https://api.stockedup.africa/uploads/:path*",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        // Never let the browser cache the service worker script itself —
        // otherwise a stale sw.js can keep re-running old caching logic
        // indefinitely, even after the server-side file is fixed/updated.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;