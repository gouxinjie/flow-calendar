/**
 * @description 统一 API 响应工具
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextResponse } from "next/server";

/**
 * @description 成功响应
 */
export function success<T>(data: T, message = "操作成功", code = 200) {
  return NextResponse.json(
    {
      success: true,
      code,
      message,
      data,
    },
    {
      headers: {
        // 禁止浏览器和 CDN 缓存 API 响应，确保客户端始终获取最新数据
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}

/**
 * @description 错误响应
 */
export function error(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      data: null,
    },
    { status },
  );
}
