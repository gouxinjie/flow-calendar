"use client";

/**
 * @component HomeRedirect
 * @description 根路由客户端重定向组件
 * 从 localStorage 或 Cookie 读取 session token 判断登录状态，
 * 避免依赖服务端 Cookie（夸克浏览器可能不携带）
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-06-27
 */
import { useEffect } from "react";

import { getSessionToken } from "@/services/api-client";

export function HomeRedirect() {
  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      window.location.replace("/calendar");
      return;
    }

    // 都没有，跳转到登录页
    window.location.replace("/login");
  }, []);

  // 渲染加载提示，防止 JS 加载失败时完全空白
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F7FAF9]">
      <p className="text-[#A8B8B0] text-[14px] animate-pulse">正在进入...</p>
    </div>
  );
}
