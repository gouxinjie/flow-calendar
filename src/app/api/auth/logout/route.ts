/**
 * @description 退出登录 API
 * @route POST /api/auth/logout
 * @author gouxinjie
 * @created 2026-06-22
 */
import type { NextRequest } from "next/server";

import { clearSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { success, error } from "@/server/response";

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    await clearSession();
    return success(null, "已退出登录");
  } catch (err) {
    console.error("退出登录失败:", err);
    return error("INTERNAL_ERROR", "退出登录失败", 500);
  }
}
