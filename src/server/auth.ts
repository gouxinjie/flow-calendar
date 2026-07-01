/**
 * @description 服务端鉴权工具 - 从会话 Cookie 或自定义 Header 中解析用户身份
 * 同时支持 Cookie 和 X-Auth-Token Header 双通道鉴权，
 * 兼容夸克浏览器等不稳定携带 Cookie 的环境。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-26
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/** 模拟会话 Cookie 名称 */
const SESSION_COOKIE = "lime_calendar_session";

/**
 * @description 开发环境输出鉴权重定向上下文，便于定位是谁反复打回登录页
 * 注意：此函数会调用 cookies() 和 headers()，本身有性能开销，
 * 仅在 requireUserId 发现无 session 时才调用，不要在其他路径调用
 */
async function logAuthRedirect(reason: "missing_session"): Promise<void> {
  if (process.env.NODE_ENV === "production") return;

  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    const hasSession = Boolean(session);
    // 仅在确实没有 session 时才调用 headers()，减少不必要的动态操作
    if (!hasSession) {
      const headerStore = await headers();
      console.warn("[auth] redirect to /login", {
        reason,
        hasSessionCookie: false,
        hasAuthTokenHeader: Boolean(headerStore.get("x-auth-token")),
        isRscRequest: headerStore.has("rsc"),
      });
    } else {
      console.warn("[auth] redirect to /login (unexpected, has cookie)", {
        reason,
        hasSessionCookie: true,
      });
    }
  } catch {
    // 静默失败，不影响业务逻辑
  }
}

/**
 * @description 从请求中获取当前登录用户 ID
 * 按优先级检查：
 * 1. Cookie（标准浏览器的主要方式）
 * 2. X-Auth-Token Header（夸克浏览器的兜底方式）
 *
 * 本期为简化实现，session 值即 userId。
 * 生产环境应使用 Auth.js 或 JWT 方案。
 */
export async function getUserId(): Promise<string | null> {
  try {
    // 方式一：从 Cookie 读取（绝大多数请求走这条快速路径）
    const cookieStore = await cookies();
    const cookieSession = cookieStore.get(SESSION_COOKIE);

    if (cookieSession?.value) {
      return cookieSession.value;
    }

    // 方式二：从自定义 Header 读取（夸克浏览器兜底，仅在无 Cookie 时才执行）
    const headerStore = await headers();
    const headerToken = headerStore.get("x-auth-token");

    if (headerToken) {
      return headerToken;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * @description 在服务端页面中强制要求用户已登录
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();

  if (!userId) {
    await logAuthRedirect("missing_session");
    redirect("/login");
  }

  return userId;
}

/**
 * @description 设置登录会话 Cookie
 * 仅设置 httpOnly Cookie，用于标准浏览器。
 * 夸克浏览器通过 X-Auth-Token Header 兜底，不需要依赖此 Cookie。
 */
export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  });
}

/**
 * @description 清除登录会话 Cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
