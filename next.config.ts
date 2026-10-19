import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services/ac-installation",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
