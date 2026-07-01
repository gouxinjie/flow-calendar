import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 生成 standalone 自包含构建产物，ECS 部署无需携带完整 node_modules */
  output: "standalone",
};

export default nextConfig;
