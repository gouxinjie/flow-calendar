/**
 * @description 新建标签 API
 * @route POST /api/tags
 * @author gouxinjie
 * @created 2026-08-10
 */
import { readBodyJson } from "../../utils/http";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { success, error } from "../../utils/response";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default defineEventHandler(async (event) => {
  try {
    if (!isTrustedMutationRequest(event)) {
      return error(event, "FORBIDDEN", "非法请求来源", 403);
    }

    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const body = await readBodyJson(event);
    const { name, color, icon, category, sortOrder } = body as {
      name?: string;
      color?: string;
      icon?: string;
      category?: string;
      sortOrder?: number;
    };
    const normalizedName = String(name ?? "").trim();
    const normalizedColor = String(color ?? "").trim();

    if (!normalizedName || !normalizedColor) {
      return error(event, "INVALID_PARAMS", "缺少必填字段：名称、颜色", 400);
    }

    if (normalizedName.length > 10) {
      return error(event, "INVALID_PARAMS", "标签名称不能超过 10 个字符", 400);
    }

    if (!HEX_COLOR_PATTERN.test(normalizedColor)) {
      return error(event, "INVALID_PARAMS", "标签颜色格式不正确", 400);
    }

    const tag = await prisma.activityTag.create({
      data: {
        userId,
        name: normalizedName,
        color: normalizedColor,
        icon: icon || null,
        category: category || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return success(event, tag, "标签创建成功", 201);
  } catch (err) {
    console.error("创建标签失败:", err);
    return error(event, "INTERNAL_ERROR", "创建标签失败", 500);
  }
});
