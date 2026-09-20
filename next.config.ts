import { env } from "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },

  async rewrites() {
    const apiUrl = env.NEXT_PUBLIC_SITE_URL;

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/login",
        destination: "/auth/login",
      },
      {
        source: "/register",
        destination: "/auth/signup",
      },
      {
        source: "/signup",
        destination: "/auth/signup",
      },
      {
        source: "/auth/register",
        destination: "/auth/signup",
      },
    ];
  },
};

export default nextConfig;