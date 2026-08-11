/**
 * @description 服务端鉴权工具 - 从会话 Cookie 或自定义 Header 中解析用户身份
 * 同时支持 Cookie 和 X-Auth-Token Header 双通道鉴权，
 * 兼容夸克浏览器等不稳定携带 Cookie 的环境。
 *
 * 注意：此处直接操作 Node 原生 req/res，避免 h3 版本不一致导致的兼容问题。
 * @author gouxinjie
 * @created 2026-08-10
 */
import type { HttpEvent } from "./http";

/** 模拟会话 Cookie 名称 */
const SESSION_COOKIE = "lime_calendar_session";

/**
 * @description 解析 Cookie 字符串中的指定 cookie 值
 */
function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * @description 从请求中获取当前登录用户 ID
 * 按优先级检查：
 * 1. Cookie（标准浏览器的主要方式）
 * 2. X-Auth-Token Header（夸克浏览器的兜底方式）
 * 本期为简化实现，session 值即 userId。
 */
export function getUserId(event: HttpEvent): string | null {
  try {
    // 方式一：从 Cookie 读取
    const cookieHeader = event.node.req.headers.cookie;
    const cookieSession = parseCookie(cookieHeader, SESSION_COOKIE);
    if (cookieSession) {
      return cookieSession;
    }

    // 方式二：从自定义 Header 读取
    const headerToken = event.node.req.headers["x-auth-token"];
    if (headerToken) {
      return String(headerToken);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * @description 在服务端接口中强制要求用户已登录
 * 未登录时返回 null（由调用方决定响应）
 */
export function requireUserId(event: HttpEvent): string | null {
  return getUserId(event);
}

/**
 * @description 构造 Set-Cookie 头字符串
 */
function buildSetCookie(value: string, maxAge: number): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/**
 * @description 设置登录会话 Cookie
 */
export function setSession(event: HttpEvent, userId: string): void {
  event.node.res.setHeader("Set-Cookie", buildSetCookie(userId, 60 * 60 * 24 * 7));
}

/**
 * @description 清除登录会话 Cookie
 */
export function clearSessionCookie(event: HttpEvent): void {
  event.node.res.setHeader("Set-Cookie", buildSetCookie("", 0));
}
