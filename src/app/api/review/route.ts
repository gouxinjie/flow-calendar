/**
 * @description 月度回顾 API
 * @route GET /api/review?month=YYYY-MM
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import dayjs from "dayjs";

import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { success, error } from "@/server/response";

/** GET /api/review - 获取月度回顾数据 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM

    if (!month) {
      return error("INVALID_PARAMS", "请提供月份参数", 400);
    }

    if (!dayjs(`${month}-01`, "YYYY-MM-DD", true).isValid()) {
      return error("INVALID_PARAMS", "月份格式不正确", 400);
    }

    // 查询该月所有记录
    const records = await prisma.activityLog.findMany({
      where: {
        userId,
        date: { startsWith: month },
      },
      include: { tag: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    // 记录总数
    const totalRecords = records.length;

    // 记录天数（去重日期）
    const uniqueDates = new Set(records.map((r) => r.date));
    const recordDays = uniqueDates.size;

    // 高频标签 Top N（排除未分类）
    const tagCountMap = new Map<string, { tagId: string; tagName: string; tagColor: string; count: number }>();
    for (const r of records) {
      if (r.tag) {
        const existing = tagCountMap.get(r.tag.id);
        if (existing) {
          existing.count++;
        } else {
          tagCountMap.set(r.tag.id, {
            tagId: r.tag.id,
            tagName: r.tag.name,
            tagColor: r.tag.color,
            count: 1,
          });
        }
      }
    }
    const topTags = Array.from(tagCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 最近记录（取前 10 条）
    const recentRecords = records.slice(0, 10);

    return success({
      year: parseInt(month.split("-")[0]),
      month: parseInt(month.split("-")[1]),
      totalRecords,
      recordDays,
      topTags,
      recentRecords,
    });
  } catch (err) {
    console.error("查询月度回顾失败:", err);
    return error("INTERNAL_ERROR", "查询月度回顾失败", 500);
  }
}
