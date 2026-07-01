/**
 * @description 单条标签 API - 更新和删除
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getUserId } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { success, error } from "@/server/response";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** PUT /api/tags/[id] - 更新标签 */
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
    const { name, color, icon, category, sortOrder, enabled } = body;

    // 校验归属
    const existing = await prisma.activityTag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error("NOT_FOUND", "标签不存在", 404);
    }

    if (name !== undefined && !String(name).trim()) {
      return error("INVALID_PARAMS", "标签名称不能为空", 400);
    }

    if (name !== undefined && String(name).trim().length > 10) {
      return error("INVALID_PARAMS", "标签名称不能超过 10 个字符", 400);
    }

    if (color !== undefined && !HEX_COLOR_PATTERN.test(String(color).trim())) {
      return error("INVALID_PARAMS", "标签颜色格式不正确", 400);
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

    return success(tag, "标签更新成功");
  } catch (err) {
    console.error("更新标签失败:", err);
    return error("INTERNAL_ERROR", "更新标签失败", 500);
  }
}

/** DELETE /api/tags/[id] - 删除标签 */
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

    const existing = await prisma.activityTag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return error("NOT_FOUND", "标签不存在", 404);
    }

    // 删除标签，关联记录 tagId 设为 null（由 Prisma onDelete: SetNull 处理）
    await prisma.activityTag.delete({ where: { id } });

    return success(null, "标签已删除");
  } catch (err) {
    console.error("删除标签失败:", err);
    return error("INTERNAL_ERROR", "删除标签失败", 500);
  }
}
