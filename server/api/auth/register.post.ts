/**
 * @description 注册 API
 * @route POST /api/auth/register
 * @author gouxinjie
 * @created 2026-08-10
 */
import { readBodyJson } from "../../utils/http";

import { prisma } from "../../utils/db";
import { setSession } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { hashPassword } from "../../utils/password";
import { DEFAULT_TAGS } from "../../utils/default-tags";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  if (!isTrustedMutationRequest(event)) {
    return error(event, "FORBIDDEN", "非法请求来源", 403);
  }

  const body = await readBodyJson(event);
  const { name, phone, password } = body as { name?: string; phone?: string; password?: string };

  if (!name || !phone || !password) {
    return error(event, "INVALID_PARAMS", "请填写完整信息", 400);
  }

  if (password.length < 6) {
    return error(event, "INVALID_PARAMS", "密码至少 6 位", 400);
  }

  // 校验手机号格式
  if (!/^1\d{10}$/.test(String(phone).trim())) {
    return error(event, "INVALID_PARAMS", "请输入 11 位手机号", 400);
  }

  try {
    // 检查手机号是否已注册
    const existing = await prisma.user.findUnique({ where: { phone: String(phone).trim() } });
    if (existing) {
      return error(event, "PHONE_EXISTS", "该手机号已注册", 409);
    }

    // 事务：原子性创建用户和默认标签
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: String(name).trim(),
          phone: String(phone).trim(),
          passwordHash: hashPassword(password),
        },
      });

      // 新用户注册后自动初始化默认标签
      await tx.activityTag.createMany({
        data: DEFAULT_TAGS.map((tag) => ({
          ...tag,
          userId: newUser.id,
        })),
      });

      return newUser;
    });

    // 自动登录
    setSession(event, user.id);

    return success(event, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      sessionToken: user.id,
    }, "注册成功", 201);
  } catch (err) {
    console.error("注册失败:", err);
    return error(event, "INTERNAL_ERROR", "注册失败", 500);
  }
});
