/**
 * @description 客户端 API 请求封装
 *
 * 鉴权策略（三重保障，兼容夸克浏览器）：
 * 1. credentials: "include" — 确保标准浏览器携带 Cookie
 * 2. X-Auth-Token 自定义 Header — 从 localStorage 取 token，夸克浏览器兜底
 * 3. Cookie — 服务端 setSession 写入的 httpOnly cookie
 */
import type { ApiResponse } from "@/types/models";

/** 会话 token 在 localStorage 中的 key */
const LOCALSTORAGE_SESSION_KEY = "lime_calendar_token";

/** 会话 Cookie 名称，与服务端保持一致 */
const SESSION_COOKIE = "lime_calendar_session";

/**
 * @description 从 localStorage 获取 session token
 * 夸克浏览器可能不发送 Cookie，因此用 localStorage + 自定义 Header 做兜底
 */
function getLocalSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LOCALSTORAGE_SESSION_KEY);
  } catch {
    // localStorage 可能被禁用或处于隐私模式
    return null;
  }
}

/**
 * @description 从 Cookie 中读取 session token
 */
function getCookieSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
    if (match) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // 静默失败
  }
  return null;
}

/**
 * @description 从 localStorage 或 Cookie 中读取 session token
 * 优先 localStorage（夸克浏览器兜底），Cookie 做降级
 * 供客户端组件在 useEffect 中判断登录状态
 */
export function getSessionToken(): string | null {
  // 方式一：localStorage（夸克浏览器兜底，优先）
  const localToken = getLocalSessionToken();
  if (localToken) return localToken;

  // 方式二：Cookie 降级
  return getCookieSessionToken();
}

export async function requestApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const localToken = getLocalSessionToken();

  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      // 夸克浏览器兜底：将 localStorage 中的 token 通过自定义 Header 发送
      ...(localToken ? { "X-Auth-Token": localToken } : {}),
      ...(init?.headers ?? {}),
    },
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error("服务返回格式异常");
  }

  if (!payload.success) {
    throw new Error(payload.message);
  }

  return payload.data;
}

/**
 * @description 将 session token 存储到 localStorage
 * 供后续 API 请求的 X-Auth-Token Header 使用
 */
export function saveSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALSTORAGE_SESSION_KEY, token);
  } catch {
    // 静默失败
  }
}

/**
 * @description 清除 localStorage 中的 session token
 */
export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCALSTORAGE_SESSION_KEY);
  } catch {
    // 静默失败
  }
}
