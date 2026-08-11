/**
 * @description 活动记录列表 API
 * @route GET /api/records
 * @author gouxinjie
 * @created 2026-08-10
 */
import { parseQuery } from "../../utils/http";
import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../utils/db";
import { getUserId } from "../../utils/auth";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return error(event, "UNAUTHORIZED", "请先登录", 401);
    }

    const query = parseQuery(event);
    const date = typeof query.date === "string" ? query.date : undefined;
    const month = typeof query.month === "string" ? query.month : undefined;
    const keyword = typeof query.keyword === "string" ? query.keyword : undefined;
    const tagId = typeof query.tagId === "string" ? query.tagId : undefined;
    const startDate = typeof query.startDate === "string" ? query.startDate : undefined;
    const endDate = typeof query.endDate === "string" ? query.endDate : undefined;
    const includeUncategorized = typeof query.includeUncategorized === "string" ? query.includeUncategorized : undefined;
    const sort = query.sort === "asc" ? "asc" : "desc";

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

    // 自动为当月及之前的周末补"休息"记录
    if (month && records.length === 0) {
      const today = dayjs().format("YYYY-MM-DD");
      const monthStart = dayjs(`${month}-01`);
      const monthEnd = monthStart.endOf("month");

      const weekendDates: string[] = [];
      let cursor = monthStart;
      while (cursor.isBefore(monthEnd) || cursor.isSame(monthEnd, "day")) {
        const dow = cursor.day();
        if ((dow === 0 || dow === 6) && cursor.format("YYYY-MM-DD") <= today) {
          weekendDates.push(cursor.format("YYYY-MM-DD"));
        }
        cursor = cursor.add(1, "day");
      }

      if (weekendDates.length > 0) {
        const existingDates = await prisma.activityLog.findMany({
          where: { userId, date: { in: weekendDates } },
          select: { date: true },
          distinct: ["date"],
        });
        const existingSet = new Set(existingDates.map((r) => r.date));

        const datesToFill = weekendDates.filter((d) => !existingSet.has(d));

        if (datesToFill.length > 0) {
          const restTag = await prisma.activityTag.findFirst({
            where: { userId, name: "休息" },
            select: { id: true },
          });

          if (restTag) {
            await prisma.activityLog.createMany({
              data: datesToFill.map((date) => ({
                userId,
                title: "休息",
                tagId: restTag.id,
                date,
              })),
            });

            const updatedRecords = await prisma.activityLog.findMany({
              where,
              include: { tag: true },
              orderBy: [{ date: sort }, { createdAt: sort }],
            });

            return success(event, updatedRecords);
          }
        }
      }
    }

    return success(event, records);
  } catch (err) {
    console.error("查询记录失败:", err);
    return error(event, "INTERNAL_ERROR", "查询记录失败", 500);
  }
});
