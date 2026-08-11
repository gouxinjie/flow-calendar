/**
 * @description 统一 API 响应工具
 * @author gouxinjie
 * @created 2026-08-10
 */
import type { HttpEvent } from "./http";

/**
 * @description 成功响应
 * 返回统一结构 { success, code, message, data }
 */
export function success<T>(event: HttpEvent, data: T, message = "操作成功", code = 200) {
  // 直接操作 Node 原生响应对象，避免 h3 版本不一致导致的兼容问题
  event.node.res.statusCode = code === 201 ? 201 : 200;
  event.node.res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");
  return {
    success: true,
    code,
    message,
    data,
  };
}

/**
 * @description 错误响应
 * 设置 HTTP 状态码并返回统一错误结构 { success:false, code, message, data:null }
 */
export function error(event: HttpEvent, code: string, message: string, status = 400) {
  event.node.res.statusCode = status;
  event.node.res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");
  return {
    success: false,
    code,
    message,
    data: null,
  };
}
