/**
 * @description HTTP 请求工具（Node 原生实现）
 * 避免直接依赖根 h3 包导致与 Nitro 内嵌 h3 版本不一致的问题。
 * 注意：函数名避免与 h3 全局导出（readBody/getQuery/getRouterParam）同名，
 * 防止 Nitro 自动导入 server/utils 时产生命名冲突。
 * @author gouxinjie
 * @created 2026-08-10
 */

/** 请求事件类型（兼容 Nitro H3Event 的核心结构） */
export interface HttpEvent {
  node: {
    req: import("node:http").IncomingMessage;
    res: import("node:http").ServerResponse;
  };
  context: Record<string, unknown>;
}

/**
 * @description 读取请求体并解析为 JSON 对象
 */
export async function readBodyJson<T = Record<string, unknown>>(event: HttpEvent): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of event.node.req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return {} as T;
  return JSON.parse(raw) as T;
}

/**
 * @description 解析请求 query 参数
 */
export function parseQuery(event: HttpEvent): Record<string, string | string[] | undefined> {
  const url = event.node.req.url ?? "";
  const queryStart = url.indexOf("?");
  if (queryStart === -1) return {};
  const searchParams = new URLSearchParams(url.slice(queryStart + 1));
  const result: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((value, key) => {
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  });
  return result;
}

/**
 * @description 读取路由参数
 */
export function getRouteParam(event: HttpEvent, name: string): string | undefined {
  const params = event.context.params as Record<string, string> | undefined;
  return params?.[name];
}
