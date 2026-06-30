/**
 * @description 活动记录 API - CRUD 操作
 * @route POST /api/records - 新增记录
 * @route GET /api/records - 查询记录列表
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { success, error } from "@/server/response";
import { isValidDate } from "@/lib/validation";

/** GET /api/records - 查询记录列表 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const keyword = searchParams.get("keyword");
    const tagId = searchParams.get("tagId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeUncategorized = searchParams.get("includeUncategorized");
    const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

    // 构建查询条件
    const where: Prisma.ActivityLogWhereInput = { userId };

    if (date) {
      where.date = date;
    } else if (month) {
      where.date = { startsWith: month };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { note: { contains: keyword } },
      ];
    }

    if (tagId === "uncategorized") {
      where.tagId = null;
    } else if (tagId) {
      where.tagId = tagId;
    } else if (includeUncategorized === "false") {
      where.NOT = { tagId: null };
    }

    if (startDate) {
      where.date = { ...((where.date as object) ?? {}), gte: startDate };
    }
    if (endDate) {
      where.date = { ...((where.date as object) ?? {}), lte: endDate };
    }

    const records = await prisma.activityLog.findMany({
      where,
      include: { tag: true },
      orderBy: [{ date: sort }, { createdAt: sort }],
    });

    return success(records);
  } catch (err) {
    console.error("查询记录失败:", err);
    return error("INTERNAL_ERROR", "查询记录失败", 500);
  }
}

/** POST /api/records - 新增记录 */
export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const body = await request.json();
    const { title, tagId, date, note, startTime } = body;
    const normalizedTitle = String(title ?? "").trim();
    const normalizedDate = String(date ?? "").trim();
    const normalizedNote = String(note ?? "").trim();
    const normalizedStartTime = startTime ? String(startTime).trim() : null;

    // 校验必填字段
    if (!normalizedTitle || !normalizedDate) {
      return error("INVALID_PARAMS", "缺少必填字段：标题、日期", 400);
    }

    if (!isValidDate(normalizedDate)) {
      return error("INVALID_DATE", "日期格式不正确", 400);
    }

    // 校验开始时间格式 HH:mm
    if (normalizedStartTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(normalizedStartTime)) {
      return error("INVALID_PARAMS", "开始时间格式不正确", 400);
    }

    // 校验日期不能是未来
    const today = dayjs().format("YYYY-MM-DD");
    if (normalizedDate > today) {
      return error("INVALID_DATE", "不能创建未来日期的记录", 400);
    }

    // 限制每天最多 3 条记录
    const sameDayCount = await prisma.activityLog.count({
      where: { userId, date: normalizedDate },
    });
    if (sameDayCount >= 3) {
      return error("LIMIT_EXCEEDED", "每天最多记录 3 条", 400);
    }

    if (tagId) {
      const tag = await prisma.activityTag.findFirst({
        where: { id: String(tagId), userId },
        select: { id: true },
      });

      if (!tag) {
        return error("INVALID_PARAMS", "所选标签不存在", 400);
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

    return success(record, "记录创建成功", 201);
  } catch (err) {
    console.error("创建记录失败:", err);
    return error("INTERNAL_ERROR", "创建记录失败", 500);
  }
}
