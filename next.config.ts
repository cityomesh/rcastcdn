import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/api/rules",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "ssh2"];
    }
    return config;
  },
};

export default nextConfig;
