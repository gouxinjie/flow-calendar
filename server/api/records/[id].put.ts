/**
 * @description 更新活动记录 API
 * @route PUT /api/records/[id]
 * @author gouxinjie
 * @created 2026-08-10
 */
import { getRouteParam, readBodyJson } from "../../utils/http";
import dayjs from "dayjs";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { success, error } from "../../utils/response";

/** 校验日期格式 */
function isValidDate(date: string): boolean {
  return dayjs(date, "YYYY-MM-DD", true).isValid();
}

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
      return error(event, "INVALID_PARAMS", "缺少记录 ID", 400);
    }

    const body = await readBodyJson(event);
    const { title, tagId, date, note, startTime } = body as {
      title?: string;
      tagId?: string;
      date?: string;
      note?: string;
      startTime?: string;
    };

    // 校验记录归属
    const existing = await prisma.activityLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error(event, "NOT_FOUND", "记录不存在", 404);
    }

    // 校验开始时间格式
    if (startTime !== undefined && startTime !== null && startTime !== "") {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(startTime))) {
        return error(event, "INVALID_PARAMS", "开始时间格式不正确", 400);
      }
    }

    // 校验日期
    if (date) {
      if (!isValidDate(String(date))) {
        return error(event, "INVALID_DATE", "日期格式不正确", 400);
      }

      const today = dayjs().format("YYYY-MM-DD");
      if (date > today) {
        return error(event, "INVALID_DATE", "不能修改为未来日期", 400);
      }
    }

    if (tagId) {
      const tag = await prisma.activityTag.findFirst({
        where: { id: String(tagId), userId },
        select: { id: true },
      });

      if (!tag) {
        return error(event, "INVALID_PARAMS", "所选标签不存在", 400);
      }
    }

    const record = await prisma.activityLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(tagId !== undefined && { tagId: tagId || null }),
        ...(date !== undefined && { date }),
        ...(note !== undefined && { note: String(note).trim() || null }),
        ...(startTime !== undefined && { startTime: startTime ? String(startTime).trim() : null }),
      },
      include: { tag: true },
    });

    return success(event, record, "记录更新成功");
  } catch (err) {
    console.error("更新记录失败:", err);
    return error(event, "INTERNAL_ERROR", "更新记录失败", 500);
  }
});
