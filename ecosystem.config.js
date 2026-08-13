/**
 * PM2 进程守护配置
 * 用于阿里云 ECS 上管理 Nuxt 3 生产服务
 *
 * 使用方式：
 *   pm2 start ecosystem.config.js    # 启动
 *   pm2 reload ecosystem.config.js   # 热重载（零停机）
 *   pm2 stop flow-calendar           # 停止
 *   pm2 logs flow-calendar           # 查看日志
 *   pm2 save                         # 保存进程列表（开机自启）
 *   pm2 startup                      # 设置开机自启
 */

const fs = require("fs");
const path = require("path");

/**
 * @description 从 .env 文件读取环境变量（避免在生产运行时找不到 DATABASE_URL）
 * Nuxt node-server 生产运行时不会自动加载 .env，需在此注入
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {};
  const result = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // 去除引号
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

module.exports = {
  apps: [
    {
      name: "flow-calendar",
      /** Nuxt 3 node-server 构建产物入口文件（绝对路径，避免 PM2 cwd 相对解析歧义） */
      script: "/var/www/flow-calendar/app/.output/server/index.mjs",
      /** 工作目录（绝对路径，避免 Next.js 迁移 Nuxt 后 cwd 残留旧目录） */
      cwd: "/var/www/flow-calendar/app",
      /** 环境变量（合并 .env 中的配置，如 DATABASE_URL） */
      env: {
        ...loadEnvFile(),
        NODE_ENV: "production",
        PORT: "3400",
        HOST: "0.0.0.0",
        HOSTNAME: "127.0.0.1",
      },
      /** 单实例（SQLite 不支持多进程写入） */
      instances: 1,
      exec_mode: "fork",
      /** 内存超过 512MB 自动重启 */
      max_memory_restart: "512M",
      /** 崩溃自动重启 */
      autorestart: true,
      /** 文件变更不自动重启（由 CI/CD 控制） */
      watch: false,
      /** 日志输出 */
      error_file: "../logs/error.log",
      out_file: "../logs/access.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
