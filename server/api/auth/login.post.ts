/**
 * @description 登录 API
 * @route POST /api/auth/login
 * @author gouxinjie
 * @created 2026-08-10
 */
import { readBodyJson } from "../../utils/http";

import { prisma } from "../../utils/db";
import { setSession } from "../../utils/auth";
import { isTrustedMutationRequest } from "../../utils/request";
import { hashPassword, isHashedPassword, verifyPassword } from "../../utils/password";
import { success, error } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    if (!isTrustedMutationRequest(event)) {
      return error(event, "FORBIDDEN", "非法请求来源", 403);
    }

    let body: { phone?: string; password?: string };
    try {
      body = (await readBodyJson(event)) as { phone?: string; password?: string };
    } catch (bodyErr) {
      console.error("[login] readBody 失败:", bodyErr);
      return error(event, "INVALID_PARAMS", "请求体格式错误", 400);
    }

    const { phone, password } = body;

    if (!phone || !password) {
      return error(event, "INVALID_PARAMS", "请输入手机号和密码", 400);
    }

    // 校验手机号格式
    if (!/^1\d{10}$/.test(String(phone).trim())) {
      return error(event, "INVALID_PARAMS", "请输入 11 位手机号", 400);
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { phone: String(phone).trim() } });
    if (!user) {
      return error(event, "INVALID_CREDENTIALS", "手机号或密码错误", 401);
    }

    const isPasswordValid = isHashedPassword(user.passwordHash)
      ? verifyPassword(password, user.passwordHash)
      : user.passwordHash === password;

    if (!isPasswordValid) {
      return error(event, "INVALID_CREDENTIALS", "手机号或密码错误", 401);
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
    setSession(event, user.id);

    // 夸克浏览器等环境可能不处理 fetch 响应中的 Set-Cookie
    // 同时返回 sessionToken 到 body 中，客户端可做双重写入
    return success(event, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      sessionToken: user.id,
    }, "登录成功", 200);
  } catch (err) {
    console.error("登录失败:", err);
    return error(event, "INTERNAL_ERROR", "登录失败", 500);
  }
});
