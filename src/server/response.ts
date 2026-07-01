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
  return NextResponse.json({
    success: true,
    code,
    message,
    data,
  });
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
