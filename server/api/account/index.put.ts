/**
 * @description 更新当前用户资料 API
 * @route PUT /api/account
 * @author gouxinjie
 * @created 2026-08-10
 */
import { readBodyJson } from "../../utils/http";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { error, success } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    if (!isTrustedMutationRequest(event)) {
      return error(event, "FORBIDDEN", "非法请求来源", 403);
    }

    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const body = await readBodyJson(event) as { name?: string; phone?: string };
    const nextName = body.name?.trim();
    const nextPhone = body.phone?.trim();

    if (!nextName) {
      return error(event, "INVALID_PARAMS", "用户名不能为空", 400);
    }

    if (nextName.length > 20) {
      return error(event, "INVALID_PARAMS", "用户名不能超过 20 个字符", 400);
    }

    // 校验手机号格式
    if (nextPhone && !/^1\d{10}$/.test(nextPhone)) {
      return error(event, "INVALID_PARAMS", "请输入 11 位手机号", 400);
    }

    // 检查手机号是否已被其他用户使用
    if (nextPhone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: nextPhone, id: { not: userId } },
      });
      if (existingUser) {
        return error(event, "CONFLICT", "该手机号已被其他账号使用", 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: nextName,
        ...(nextPhone ? { phone: nextPhone } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    return success(
      event,
      {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
      "资料已更新",
    );
  } catch (requestError) {
    console.error("更新账号信息失败:", requestError);
    return error(event, "INTERNAL_ERROR", "更新账号信息失败", 500);
  }
});
