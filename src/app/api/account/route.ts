/**
 * @description 当前用户资料 API
 */
import type { NextRequest } from "next/server";

import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { error, success } from "@/server/response";

/**
 * @description 获取当前登录用户资料
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
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
      return error("NOT_FOUND", "用户不存在", 404);
    }

    return success({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (requestError) {
    console.error("读取账号信息失败:", requestError);
    return error("INTERNAL_ERROR", "读取账号信息失败", 500);
  }
}

/**
 * @description 更新当前用户资料
 */
export async function PUT(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const body = (await request.json()) as { name?: string; phone?: string };
    const nextName = body.name?.trim();
    const nextPhone = body.phone?.trim();

    if (!nextName) {
      return error("INVALID_PARAMS", "用户名不能为空", 400);
    }

    if (nextName.length > 20) {
      return error("INVALID_PARAMS", "用户名不能超过 20 个字符", 400);
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
      {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
      "资料已更新",
    );
  } catch (requestError) {
    console.error("更新账号信息失败:", requestError);
    return error("INTERNAL_ERROR", "更新账号信息失败", 500);
  }
}
