/**
 * @description 服务端请求安全校验工具
 */
import type { NextRequest } from "next/server";

/** 本地开发常见的 origin 模式，放宽校验避免 IP 访问时被拦截 */
const LOCAL_ORIGIN_PATTERNS = [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/, /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/, /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/, /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/];

/**
 * @description 校验写操作是否来自可信来源
 * 浏览器同源请求会带上 Origin；若无 Origin 头则保守放行以兼容本地工具调用
 * 本地开发环境放宽对 localhost / 127.0.0.1 / 内网 IP 的校验
 */
export function isTrustedMutationRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  // 同源放行
  if (origin === request.nextUrl.origin) {
    return true;
  }

  // 本地开发环境：放行常见本地地址和内网 IP
  for (const pattern of LOCAL_ORIGIN_PATTERNS) {
    if (pattern.test(origin)) {
      return true;
    }
  }

  return false;
}
