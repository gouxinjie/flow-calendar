/**
 * @description 登录/注册 API
 * @route POST /api/auth/login - 登录
 * @route POST /api/auth/register - 注册
 * @route POST /api/auth/logout - 退出
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-26
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { setSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { hashPassword, isHashedPassword, verifyPassword } from "@/server/password";

/** POST /api/auth/login - 登录 */
export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return NextResponse.json(
        { success: false, code: "FORBIDDEN", message: "非法请求来源", data: null },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, code: "INVALID_PARAMS", message: "请输入邮箱和密码", data: null },
        { status: 400 },
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, code: "INVALID_CREDENTIALS", message: "邮箱或密码错误", data: null },
        { status: 401 },
      );
    }

    const isPasswordValid = isHashedPassword(user.passwordHash)
      ? verifyPassword(password, user.passwordHash)
      : user.passwordHash === password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, code: "INVALID_CREDENTIALS", message: "邮箱或密码错误", data: null },
        { status: 401 },
      );
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

    // 夸克浏览器等环境可能不处理 fetch 响应中的 Set-Cookie
    // 同时返回 sessionToken 到 body 中，客户端可做双重写入
    const response = NextResponse.json({
      success: true,
      code: 200,
      message: "登录成功",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        // 客户端兜底：返回 session token 供客户端手动写 Cookie
        sessionToken: user.id,
      },
    });

    return response;
  } catch (err) {
    console.error("登录失败:", err);
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "登录失败", data: null },
      { status: 500 },
    );
  }
}
