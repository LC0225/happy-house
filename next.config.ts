import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化构建性能
  reactStrictMode: true,

  // 优化图片
  images: {
    unoptimized: true,
  },

  // 实验性功能优化
  experimental: {
    optimizePackageImports: ['react'],
  },
};

export default nextConfig;
