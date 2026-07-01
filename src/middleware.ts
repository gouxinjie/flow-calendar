/**
 * @description 中间件 - 当前不做页面级拦截
 *
 * 鉴权全部由 AuthGuard 客户端组件完成，避免夸克浏览器 Cookie 缺失导致的重定向循环。
 * 根路由 / 由 page.tsx 服务端 redirect("/calendar") 处理。
 *
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-07-01
 */
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  // 中间件仅做占位，不拦截任何页面路由
  matcher: [],
};
