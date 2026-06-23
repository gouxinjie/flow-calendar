/**
 * @description 登录/注册 API
 * @route POST /api/auth/login - 登录
 * @route POST /api/auth/register - 注册
 * @route POST /api/auth/logout - 退出
 * @author gouxinjie
 * @created 2026-06-22
 */
import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { setSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { hashPassword, isHashedPassword, verifyPassword } from "@/server/password";
import { success, error } from "@/server/response";

/** POST /api/auth/login - 登录 */
export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return error("FORBIDDEN", "非法请求来源", 403);
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return error("INVALID_PARAMS", "请输入邮箱和密码", 400);
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error("INVALID_CREDENTIALS", "邮箱或密码错误", 401);
    }

    const isPasswordValid = isHashedPassword(user.passwordHash)
      ? verifyPassword(password, user.passwordHash)
      : user.passwordHash === password;

    if (!isPasswordValid) {
      return error("INVALID_CREDENTIALS", "邮箱或密码错误", 401);
    }

    if (!isHashedPassword(user.passwordHash)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashPassword(password),
        },
      });
    }

    // 设置会话
    await setSession(user.id);

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
    }, "登录成功");
  } catch (err) {
    console.error("登录失败:", err);
    return error("INTERNAL_ERROR", "登录失败", 500);
  }
}
