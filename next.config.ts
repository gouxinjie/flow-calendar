import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 生成 standalone 自包含构建产物，ECS 部署无需携带完整 node_modules */
  output: "standalone",
  /** 构建时注入环境变量，用于前端控制台打印发布时间 */
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
