/**
 * @description 新增活动记录 API
 * @route POST /api/records
 * @author gouxinjie
 * @created 2026-08-10
 */
import { readBodyJson } from "../../utils/http";
import dayjs from "dayjs";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { success, error } from "../../utils/response";

/** 校验日期格式是否为 YYYY-MM-DD */
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

    const body = await readBodyJson(event);
    const { title, tagId, date, note, startTime } = body as {
      title?: string;
      tagId?: string;
      date?: string;
      note?: string;
      startTime?: string;
    };
    const normalizedTitle = String(title ?? "").trim();
    const normalizedDate = String(date ?? "").trim();
    const normalizedNote = String(note ?? "").trim();
    const normalizedStartTime = startTime ? String(startTime).trim() : null;

    // 校验必填字段
    if (!normalizedTitle || !normalizedDate) {
      return error(event, "INVALID_PARAMS", "缺少必填字段：标题、日期", 400);
    }

    if (!isValidDate(normalizedDate)) {
      return error(event, "INVALID_DATE", "日期格式不正确", 400);
    }

    // 校验开始时间格式 HH:mm
    if (normalizedStartTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(normalizedStartTime)) {
      return error(event, "INVALID_PARAMS", "开始时间格式不正确", 400);
    }

    // 校验日期不能是未来
    const today = dayjs().format("YYYY-MM-DD");
    if (normalizedDate > today) {
      return error(event, "INVALID_DATE", "不能创建未来日期的记录", 400);
    }

    // 限制每天最多 3 条记录
    const sameDayCount = await prisma.activityLog.count({
      where: { userId, date: normalizedDate },
    });
    if (sameDayCount >= 3) {
      return error(event, "LIMIT_EXCEEDED", "每天最多记录 3 条", 400);
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

    const record = await prisma.activityLog.create({
      data: {
        userId,
        title: normalizedTitle,
        tagId: tagId || null,
        date: normalizedDate,
        note: normalizedNote || null,
        startTime: normalizedStartTime,
      },
      include: { tag: true },
    });

    return success(event, record, "记录创建成功", 201);
  } catch (err) {
    console.error("创建记录失败:", err);
    return error(event, "INTERNAL_ERROR", "创建记录失败", 500);
  }
});
