/**
 * @description 中间件 - 在页面渲染前处理鉴权路由跳转
 *
 * 核心原则：夸克浏览器在直接页面请求中不携带 Cookie 和自定义 Header，
 * 因此中间件对未认证的受保护路由返回 302 跳转到登录页，
 * 但对已认证用户访问登录页的跳转依赖客户端完成（因为中间件也读不到）。
 *
 * @author gouxinjie
 * @created 2026-06-26
 */
import { NextRequest, NextResponse } from "next/server";

/** 需要登录才能访问的路由前缀 */
const PROTECTED_PATHS = ["/calendar", "/me", "/review", "/tags", "/account"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查 Cookie 和自定义 Header
  const cookieSession = request.cookies.get("flow_calendar_session")?.value;
  const headerToken = request.headers.get("x-auth-token");
  const hasAuth = Boolean(cookieSession || headerToken);

  // 根路由：服务端直跳，不依赖客户端 JS
  // 有 token → /calendar，无 token → /login
  if (pathname === "/") {
    const target = hasAuth ? "/calendar" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 未登录用户访问受保护路由 → 302 到登录页
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !hasAuth) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // 已登录访问 /login：中间件不做处理（可能读不到），
  // 交由客户端 LoginPageClient 的 useEffect 处理跳转

  return NextResponse.next();
}

export const config = {
  // 排除静态资源、API 路由、Next.js 内部请求，middleware 仅拦截页面级路由
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
