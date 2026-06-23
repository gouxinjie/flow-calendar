/**
 * @description 客户端 API 请求封装
 */
import type { ApiResponse } from "@/types/models";

/**
 * @description 统一处理客户端请求与错误
 */
export async function requestApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
