/**
 * @description 注册 API
 * @route POST /api/auth/register
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-26
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { setSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { hashPassword } from "@/server/password";

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return NextResponse.json(
        { success: false, code: "FORBIDDEN", message: "非法请求来源", data: null },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, code: "INVALID_PARAMS", message: "请填写完整信息", data: null },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, code: "INVALID_PARAMS", message: "密码至少 6 位", data: null },
        { status: 400 },
      );
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, code: "EMAIL_EXISTS", message: "该邮箱已注册", data: null },
        { status: 409 },
      );
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

    const response = NextResponse.json({
      success: true,
      code: 201,
      message: "注册成功",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        sessionToken: user.id,
      },
    });

    return response;
  } catch (err) {
    console.error("注册失败:", err);
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "注册失败", data: null },
      { status: 500 },
    );
  }
}
