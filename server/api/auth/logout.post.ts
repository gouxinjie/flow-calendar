/**
 * @description 退出登录 API
 * @route POST /api/auth/logout
 * @author gouxinjie
 * @created 2026-08-10
 */
import { clearSessionCookie } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  if (!isTrustedMutationRequest(event)) {
    return error(event, "FORBIDDEN", "非法请求来源", 403);
  }

  try {
    clearSessionCookie(event);
    return success(event, null, "已退出登录");
  } catch (err) {
    console.error("退出登录失败:", err);
    return error(event, "INTERNAL_ERROR", "退出登录失败", 500);
  }
});
