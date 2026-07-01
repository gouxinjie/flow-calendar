"use client";

/**
 * @component AuthGuard
 * @description 客户端鉴权守卫组件，负责所有受保护路由的鉴权
 *
 * 夸克浏览器在页面导航中不携带 Cookie，因此 middleware 不做页面级拦截，
 * 改由此组件在客户端检查 localStorage 和 Cookie 中的 session token：
 * - 有 token：正常渲染子组件（页面内容）
 * - 无 token：跳转到登录页（带 sessionStorage 防抖，3 秒内不重复重定向）
 *
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-07-01
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { getSessionToken } from "@/services/api-client";

/** sessionStorage key，用于重定向防抖 */
const REDIRECT_GUARD_KEY = "auth_redirect_ts";
/** 重定向防抖间隔（毫秒），3 秒内同一页面不重复重定向 */
const REDIRECT_COOLDOWN_MS = 3000;

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
      setAuthChecked(true);
      return;
    }

    // sessionStorage 防抖：如果 3 秒内已经重定向过，阻断循环，显示空白
    try {
      const lastRedirect = sessionStorage.getItem(REDIRECT_GUARD_KEY);
      if (lastRedirect && Date.now() - Number(lastRedirect) < REDIRECT_COOLDOWN_MS) {
        // 可能在循环中，停止重定向，标记鉴权完成（页面保持空白）
        setAuthChecked(true);
        return;
      }
      sessionStorage.setItem(REDIRECT_GUARD_KEY, String(Date.now()));
    } catch {
      // sessionStorage 不可用时静默失败
    }

    // localStorage 和 Cookie 均无 token，跳转到登录页
    window.location.replace("/login");
  }, []);

  // 检查期间或未认证时显示空白
  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
