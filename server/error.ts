/**
 * @description Nitro 全局错误处理
 * 将所有错误统一为 { success:false, code, message, data:null } 结构
 * @author gouxinjie
 * @created 2026-08-10
 */
import type { NitroErrorHandler } from "nitropack";

export default <NitroErrorHandler>function (error, event) {
  const statusCode = error.statusCode ?? 500;
  const code = error.statusMessage ?? "INTERNAL_ERROR";
  const message = error.message ?? "服务器内部错误";

  // 设置响应头
  event.node.res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");

  event.node.res.statusCode = statusCode;
  event.node.res.setHeader("Content-Type", "application/json");
  event.node.res.end(
    JSON.stringify({
      success: false,
      code,
      message,
      data: null,
    }),
  );
};
