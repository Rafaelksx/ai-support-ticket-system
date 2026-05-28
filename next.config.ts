import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
