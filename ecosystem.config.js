/**
 * PM2 进程守护配置
 * 用于阿里云 ECS 上管理 Next.js 生产服务
 *
 * 使用方式：
 *   pm2 start ecosystem.config.js    # 启动
 *   pm2 reload ecosystem.config.js   # 热重载（零停机）
 *   pm2 stop flow-calendar           # 停止
 *   pm2 logs flow-calendar           # 查看日志
 *   pm2 save                         # 保存进程列表（开机自启）
 *   pm2 startup                      # 设置开机自启
 */

module.exports = {
  apps: [
    {
      name: "flow-calendar",
      /** standalone 构建产物入口文件 */
      script: "./server.js",
      /** 工作目录 — GitHub Actions 部署到此处 */
      cwd: "./",
      /** 环境变量 */
      env: {
        NODE_ENV: "production",
        PORT: "3400",
        HOSTNAME: "127.0.0.1", // 仅本地监听，由 Nginx 反向代理对外
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
