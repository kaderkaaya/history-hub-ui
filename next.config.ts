import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://history-hub-production.up.railway.app/:path*",
      },
    ];
  },
};

export default nextConfig;
