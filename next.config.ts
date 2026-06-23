import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 显式声明 Turbopack 配置，避免 Next.js 16 默认开发模式被 webpack 配置阻断
  turbopack: {},
  // 仅在 webpack 模式下忽略这些产物和日志文件，避免文件回写触发不必要的刷新
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/.next/**",
        "**/.playwright-cli/**",
        "**/prisma/**",
        "**/node_modules/**",
        "**/*.tsbuildinfo",
        "**/*.log",
        "**/*.err",
        "**/cookie.txt",
      ],
    };
    return config;
  },
};

export default nextConfig;
