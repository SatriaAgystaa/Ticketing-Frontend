import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://localhost:3001/v1/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/v1/uploads/files/:path*',
      },
    ]
  },
};

export default nextConfig;
