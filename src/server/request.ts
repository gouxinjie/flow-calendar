/**
 * @description 服务端请求安全校验工具
 */
import type { NextRequest } from "next/server";

/**
 * @description 校验写操作是否来自同源页面
 * 浏览器同源请求会带上 Origin；若 отсутствует，则保守放行以兼容本地工具调用
 */
export function isTrustedMutationRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  return origin === request.nextUrl.origin;
}
