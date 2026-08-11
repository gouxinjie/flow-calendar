/**
 * @description 标签列表 API
 * @route GET /api/tags
 * @author gouxinjie
 * @created 2026-08-10
 */
import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const tags = await prisma.activityTag.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });

    return success(event, tags);
  } catch (err) {
    console.error("查询标签失败:", err);
    return error(event, "INTERNAL_ERROR", "查询标签失败", 500);
  }
});
