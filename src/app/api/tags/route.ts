/**
 * @description 标签 API - CRUD 操作
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { success, error } from "@/server/response";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** GET /api/tags - 获取标签列表 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return error("UNAUTHORIZED", "请先登录", 401);
    }

    const tags = await prisma.activityTag.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });

    return success(tags);
  } catch (err) {
    console.error("查询标签失败:", err);
    return error("INTERNAL_ERROR", "查询标签失败", 500);
  }
}

/** POST /api/tags - 新建标签 */
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
    const { name, color, icon, category, sortOrder } = body;
    const normalizedName = String(name ?? "").trim();
    const normalizedColor = String(color ?? "").trim();

    if (!normalizedName || !normalizedColor) {
      return error("INVALID_PARAMS", "缺少必填字段：名称、颜色", 400);
    }

    if (normalizedName.length > 10) {
      return error("INVALID_PARAMS", "标签名称不能超过 10 个字符", 400);
    }

    if (!HEX_COLOR_PATTERN.test(normalizedColor)) {
      return error("INVALID_PARAMS", "标签颜色格式不正确", 400);
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

    return success(tag, "标签创建成功", 201);
  } catch (err) {
    console.error("创建标签失败:", err);
    return error("INTERNAL_ERROR", "创建标签失败", 500);
  }
}
