/**
 * @description 单条活动记录 API - 更新和删除
 * @route PUT /api/records/[id] - 更新记录
 * @route DELETE /api/records/[id] - 删除记录
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import dayjs from "dayjs";

import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { success, error } from "@/server/response";
import { isValidDate, isValidTime } from "@/lib/validation";

/** PUT /api/records/[id] - 更新记录 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { title, tagId, date, timeType, startTime, endTime, note } = body;

    // 校验记录归属
    const existing = await prisma.activityLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error("NOT_FOUND", "记录不存在", 404);
    }

    // 校验日期
    if (date) {
      if (!isValidDate(String(date))) {
        return error("INVALID_DATE", "日期格式不正确", 400);
      }

      const today = dayjs().format("YYYY-MM-DD");
      if (date > today) {
        return error("INVALID_DATE", "不能修改为未来日期", 400);
      }
    }

    if (timeType && !["all_day", "scheduled"].includes(String(timeType))) {
      return error("INVALID_PARAMS", "无效的时间类型", 400);
    }

    if (timeType === "scheduled") {
      if (!startTime || !isValidTime(String(startTime))) {
        return error("INVALID_PARAMS", "指定时间记录需要合法开始时间", 400);
      }
      if (!endTime || !isValidTime(String(endTime))) {
        return error("INVALID_PARAMS", "指定时间记录需要合法结束时间", 400);
      }
      if (String(startTime) >= String(endTime)) {
        return error("INVALID_PARAMS", "结束时间必须晚于开始时间", 400);
      }
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

    const record = await prisma.activityLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(tagId !== undefined && { tagId: tagId || null }),
        ...(date !== undefined && { date }),
        ...(timeType !== undefined && { timeType }),
        ...(timeType === "scheduled" && {
          startTime: String(startTime),
          endTime: String(endTime),
        }),
        ...(timeType === "all_day" && { startTime: null, endTime: null }),
        ...(note !== undefined && { note: String(note).trim() || null }),
      },
      include: { tag: true },
    });

    return success(record, "记录更新成功");
  } catch (err) {
    console.error("更新记录失败:", err);
    return error("INTERNAL_ERROR", "更新记录失败", 500);
  }
}

/** DELETE /api/records/[id] - 删除记录 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isTrustedMutationRequest(_request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const { id } = await params;

    // 校验记录归属
    const existing = await prisma.activityLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error("NOT_FOUND", "记录不存在", 404);
    }

    await prisma.activityLog.delete({ where: { id } });

    return success(null, "记录已删除");
  } catch (err) {
    console.error("删除记录失败:", err);
    return error("INTERNAL_ERROR", "删除记录失败", 500);
  }
}
