/**
 * @description 主应用布局，包含底部导航。
 *
 * 鉴权架构：
 * 1. AuthGuard 客户端组件 — 检查 localStorage/Cookie，未登录则跳转 /login
 * 2. 不再使用服务端 requireUserId() 和 middleware 页面拦截，避免夸克浏览器 Cookie 缺失导致的循环
 */
import type { ReactNode } from "react";

import { BottomNav } from "@/components/business/shared/bottom-nav";
import { AppCanvas } from "@/components/business/shared/mobile-shell";
import { AuthGuard } from "@/components/commons/auth-guard";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppCanvas className="bg-[#f1f9f6]">
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</main>
        <BottomNav />
      </AppCanvas>
    </AuthGuard>
  );
}
