#!/bin/bash
# ============================================================
# ECS 首次部署初始化脚本
# 用法：ssh 到 ECS 后执行 bash setup-ecs.sh
# ============================================================
set -e

APP_ROOT="/var/www/flow-calendar"

echo "===== 1. 创建项目目录 ====="
mkdir -p $APP_ROOT/app
mkdir -p $APP_ROOT/data
mkdir -p $APP_ROOT/logs
echo "目录结构已创建：$APP_ROOT"

echo ""
echo "===== 2. 检查 Node.js 版本 ====="
node -v
npm -v

echo ""
echo "===== 3. 安装 PM2（如未安装） ====="
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "PM2 安装完成"
else
    echo "PM2 已安装：$(pm2 -v)"
fi

echo ""
echo "===== 4. 设置 PM2 开机自启 ====="
pm2 startup systemd -u $USER --hp /root || echo "请手动运行 pm2 startup 并执行输出的命令"

echo ""
echo "===== 5. 配置 Nginx ====="
if command -v nginx &> /dev/null; then
    echo "Nginx 已安装"
    echo "请将 deploy/nginx.conf 复制到 /etc/nginx/conf.d/flow-calendar.conf"
    echo "然后执行：nginx -t && nginx -s reload"
else
    echo "Nginx 未安装，请手动安装："
    echo "  CentOS/Alibaba Linux: sudo yum install -y nginx"
    echo "  Ubuntu:               sudo apt install -y nginx"
fi

echo ""
echo "===== 6. 配置 SSH Key（用于 GitHub Actions） ====="
if [ ! -f ~/.ssh/authorized_keys ]; then
    echo "⚠  ~/.ssh/authorized_keys 不存在"
    echo "   请确保 GitHub Actions 使用的 SSH Key 已添加到 authorized_keys"
else
    echo "authorized_keys 已存在"
fi

echo ""
echo "===== 初始化完成 ====="
echo ""
echo "接下来需要在 GitHub 仓库设置以下 Secrets："
echo "  ECS_SSH_KEY     — SSH 私钥（与 ECS authorized_keys 匹配的私钥）"
echo "  ECS_HOST        — ECS 公网 IP 或域名"
echo "  ECS_USER        — SSH 用户名（一般是 root）"
echo "  ECS_DEPLOY_PATH — 部署路径，填：/var/www/flow-calendar/app"
echo ""
echo "配置完成后，推送 main 分支即可触发自动部署。"
