import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.samajsaathi.com",
      },
      {
        protocol: "https",
        hostname: "v3b.fal.media",
      },
    ],
  },
};

export default nextConfig;
