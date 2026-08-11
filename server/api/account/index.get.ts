/**
 * @description 当前用户资料 API
 * @route GET /api/account
 * @author gouxinjie
 * @created 2026-08-10
 */
import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { error, success } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error(event, "NOT_FOUND", "用户不存在", 404);
    }

    return success(event, {
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (requestError) {
    console.error("读取账号信息失败:", requestError);
    return error(event, "INTERNAL_ERROR", "读取账号信息失败", 500);
  }
});
