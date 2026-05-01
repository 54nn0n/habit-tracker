import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Disable scope hoisting — triggers a JSON.parse bug in webpack 5.98
    // (ConcatenationScope.matchModuleReference) when modules with certain
    // string patterns are merged into the same concatenated bundle.
    config.optimization.concatenateModules = false;
    return config;
  },
};

export default withPWA(nextConfig);
