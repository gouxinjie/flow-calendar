/**
 * @description 注册 API
 * @route POST /api/auth/register
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-02 - 注册后自动初始化默认标签
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { setSession } from "@/server/auth";
import { isTrustedMutationRequest } from "@/server/request";
import { hashPassword } from "@/server/password";
import { DEFAULT_TAGS } from "@/server/default-tags";

export async function POST(request: NextRequest) {
  try {
    if (!isTrustedMutationRequest(request)) {
      return NextResponse.json(
        { success: false, code: "FORBIDDEN", message: "非法请求来源", data: null },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
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

    // 校验手机号格式
    if (!/^1\d{10}$/.test(String(phone).trim())) {
      return NextResponse.json(
        { success: false, code: "INVALID_PARAMS", message: "请输入 11 位手机号", data: null },
        { status: 400 },
      );
    }

    // 检查手机号是否已注册
    const existing = await prisma.user.findUnique({ where: { phone: String(phone).trim() } });
    if (existing) {
      return NextResponse.json(
        { success: false, code: "PHONE_EXISTS", message: "该手机号已注册", data: null },
        { status: 409 },
      );
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
    await setSession(user.id);

    const response = NextResponse.json({
      success: true,
      code: 201,
      message: "注册成功",
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
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
