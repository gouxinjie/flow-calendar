/**
 * @description 注册 API
 * @route POST /api/auth/register
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { setSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { hashPassword } from "@/server/password";
import { success, error } from "@/server/response";

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return error("INVALID_PARAMS", "请填写完整信息", 400);
    }

    if (password.length < 6) {
      return error("INVALID_PARAMS", "密码至少 6 位", 400);
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error("EMAIL_EXISTS", "该邮箱已注册", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash: hashPassword(password),
      },
    });

    // 自动登录
    await setSession(user.id);

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
    }, "注册成功", 201);
  } catch (err) {
    console.error("注册失败:", err);
    return error("INTERNAL_ERROR", "注册失败", 500);
  }
}
