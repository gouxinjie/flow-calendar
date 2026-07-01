/**
 * @description 中间件 - 仅处理根路由跳转
 *
 * 夸克浏览器在页面导航中不携带 Cookie 和自定义 Header，
 * 因此中间件不做受保护路由的 302 拦截，改为由 AuthGuard 客户端组件鉴权。
 *
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-07-01
 */
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 根路由：服务端直跳，不依赖客户端 JS
  // 有 Cookie → /calendar，无 Cookie → /login
  if (pathname === "/") {
    const cookieSession = request.cookies.get("flow_calendar_session")?.value;
    const hasAuth = Boolean(cookieSession);
    const target = hasAuth ? "/calendar" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 排除静态资源、API 路由、Next.js 内部请求，middleware 仅拦截页面级路由
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
