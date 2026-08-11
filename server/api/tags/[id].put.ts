/**
 * @description 更新标签 API
 * @route PUT /api/tags/[id]
 * @author gouxinjie
 * @created 2026-08-10
 */
import { getRouteParam, readBodyJson } from "../../utils/http";

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

    const id = getRouteParam(event, "id");
    if (!id) {
      return error(event, "INVALID_PARAMS", "缺少标签 ID", 400);
    }

    const body = await readBodyJson(event);
    const { name, color, icon, category, sortOrder, enabled } = body as {
      name?: string;
      color?: string;
      icon?: string;
      category?: string;
      sortOrder?: number;
      enabled?: boolean;
    };

    // 校验归属
    const existing = await prisma.activityTag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error(event, "NOT_FOUND", "标签不存在", 404);
    }

    if (name !== undefined && !String(name).trim()) {
      return error(event, "INVALID_PARAMS", "标签名称不能为空", 400);
    }

    if (name !== undefined && String(name).trim().length > 10) {
      return error(event, "INVALID_PARAMS", "标签名称不能超过 10 个字符", 400);
    }

    if (color !== undefined && !HEX_COLOR_PATTERN.test(String(color).trim())) {
      return error(event, "INVALID_PARAMS", "标签颜色格式不正确", 400);
    }

    const tag = await prisma.activityTag.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(color !== undefined && { color: String(color).trim() }),
        ...(icon !== undefined && { icon }),
        ...(category !== undefined && { category }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return success(event, tag, "标签更新成功");
  } catch (err) {
    console.error("更新标签失败:", err);
    return error(event, "INTERNAL_ERROR", "更新标签失败", 500);
  }
});
