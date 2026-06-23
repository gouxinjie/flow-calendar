/**
 * @description 服务端鉴权工具 - 从会话 Cookie 中解析用户身份
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/** 模拟会话 Cookie 名称，实际应使用 Auth.js 或自定义方案 */
const SESSION_COOKIE = "flow_calendar_session";

/**
 * @description 开发环境输出鉴权重定向上下文，便于定位是谁反复打回登录页
 */
async function logAuthRedirect(reason: "missing_session"): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
    const session = cookieStore.get(SESSION_COOKIE)?.value ?? "";
    const pathname =
      headerStore.get("next-url") ??
      headerStore.get("x-next-url") ??
      headerStore.get("x-invoke-path") ??
      "unknown";

    console.warn("[auth] redirect to /login", {
      reason,
      pathname,
      referer: headerStore.get("referer") ?? "",
      host: headerStore.get("host") ?? "",
      userAgent: headerStore.get("user-agent") ?? "",
      accept: headerStore.get("accept") ?? "",
      purpose: headerStore.get("purpose") ?? "",
      isRscRequest: headerStore.has("rsc"),
      hasSessionCookie: Boolean(session),
    });
  } catch (error) {
    console.warn("[auth] failed to log redirect context", error);
  }
}

/**
 * @description 从请求中获取当前登录用户 ID
 * 本期为简化实现，使用 Cookie 中的 session 模拟
 * 生产环境应使用 Auth.js 或 JWT 方案
 */
export async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    if (!session?.value) return null;

    // 简化方案：session 值即 userId
    // 生产环境应解析 JWT 或查询 session 表
    return session.value;
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
 * @description 设置登录会话
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
 * @description 清除登录会话
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
