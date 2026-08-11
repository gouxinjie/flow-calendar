/**
 * @description 删除标签 API
 * @route DELETE /api/tags/[id]
 * @author gouxinjie
 * @created 2026-08-10
 */
import { getRouteParam } from "../../utils/http";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    if (!isTrustedMutationRequest(event)) {
      return error(event, "FORBIDDEN", "非法请求来源", 403);
    }

    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const id = getRouteParam(event, "id");
    if (!id) {
      return error(event, "INVALID_PARAMS", "缺少标签 ID", 400);
    }

    const existing = await prisma.activityTag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error(event, "NOT_FOUND", "标签不存在", 404);
    }

    // 删除标签，关联记录 tagId 设为 null（由 Prisma onDelete: SetNull 处理）
    await prisma.activityTag.delete({ where: { id } });

    return success(event, null, "标签已删除");
  } catch (err) {
    console.error("删除标签失败:", err);
    return error(event, "INTERNAL_ERROR", "删除标签失败", 500);
  }
});
