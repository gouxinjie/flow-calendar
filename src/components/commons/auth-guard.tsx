"use client";

/**
 * @component AuthGuard
 * @description 客户端鉴权守卫组件，替代服务端 requireUserId()
 *
 * 夸克浏览器在 RSC 请求中不稳定携带 Cookie，导致服务端鉴权不可靠。
 * 此组件在客户端检查 localStorage 和 Cookie 中的 session token：
 * - 有 token：正常渲染子组件（页面内容）
 * - 无 token：跳转到登录页
 *
 * 必须配合 middleware.ts 使用，middleware 负责第一道拦截（HTTP 302），
 * 此组件负责兜底保护。
 *
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-06-27
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getSessionToken } from "@/services/api-client";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      // localStorage 和 Cookie 均无 token，跳转到登录页
      window.location.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, []);

  // 检查期间或未认证时显示空白
  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
