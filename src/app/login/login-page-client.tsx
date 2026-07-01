"use client";

/**
 * @component LoginPageClient
 * @description 登录页客户端表单与交互逻辑
 * 不再自动跳转（避免夸克浏览器 Cookie 缺失导致 middleware 循环），
 * 仅渲染登录/注册表单，登录成功后跳转至月历页。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01
 */
import { useState } from "react";
import { DeviceMobile, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

import { StateBanner } from "@/components/commons/state-banner";

import { saveSessionToken } from "@/services/api-client";
import type { ApiResponse, AuthSessionData } from "@/types/models";

/** 会话 Cookie 名称，与服务端保持一致 */
const SESSION_COOKIE = "lime_calendar_session";

/**
 * @description 夸克浏览器兜底：客户端手动设置 session cookie
 * 夸克浏览器可能不处理 fetch 响应中的 httpOnly Set-Cookie，
 * 这里用非 httpOnly cookie 做兜底写入
 */
function setClientSessionCookie(token: string): void {
  try {
    document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } catch {
    // 静默失败，不影响主流程
  }
}

export function LoginPageClient() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("13113183859");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (mode === "register" && !name.trim()) {
      setNotice({ tone: "error", message: "请输入用户名" });
      return;
    }

    if (!phone.trim() || !password) {
      setNotice({ tone: "error", message: "请输入手机号和密码" });
      return;
    }

    // 前端校验手机号格式
    if (!/^1\d{10}$/.test(phone.trim())) {
      setNotice({ tone: "error", message: "请输入 11 位手机号" });
      return;
    }

    // 注册模式：前端校验密码最小长度
    if (mode === "register" && password.length < 6) {
      setNotice({ tone: "error", message: "密码至少 6 位" });
      return;
    }

    setNotice(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(mode === "register" ? { name: name.trim() } : {}),
          phone: phone.trim(),
          password,
        }),
      });

      const payload: ApiResponse<AuthSessionData> = await response.json();

      if (!payload.success) {
        throw new Error(payload.message);
      }

      // 夸克浏览器兜底：客户端手动写入 session cookie 和 localStorage
      if (payload.data?.sessionToken) {
        setClientSessionCookie(payload.data.sessionToken);
        // 同时存入 localStorage，供后续 API 请求的 X-Auth-Token Header 使用
        saveSessionToken(payload.data.sessionToken);
      }

      setNotice({
        tone: "success",
        message: mode === "login" ? "登录成功，正在进入月历页" : "注册成功，正在进入月历页",
      });

      // localStorage 已同步写入，直接跳转即可
      window.location.href = "/calendar";
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "操作失败";
      setNotice({ tone: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F3FAF7] px-6">
      {/* Logo / 品牌区 */}
      <div className="animate-page-enter w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#5EBF3F]">
            青柠日历
          </h1>
          <p className="mt-2 text-[14px] text-[#6B7A7A]">
            记录已发生的生活，留在月历上
          </p>
        </div>

        {/* 登录/注册切换 */}
        <div className="mb-6 grid grid-cols-2 rounded-[10px] bg-[#EDF5E9] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-[8px] px-3 py-2 text-[14px] font-medium ${
              mode === "login" ? "bg-white text-[#1F2A2A] shadow-sm" : "text-[#6B7A7A]"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-[8px] px-3 py-2 text-[14px] font-medium ${
              mode === "register" ? "bg-white text-[#1F2A2A] shadow-sm" : "text-[#6B7A7A]"
            }`}
          >
            注册
          </button>
        </div>

        {notice ? (
          <StateBanner tone={notice.tone} message={notice.message} className="mb-4" />
        ) : null}

        {/* 使用 <form> 让浏览器密码管理器识别并自动填充 */}
        <form onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div className="mb-3">
              <div className="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
                <input
                  type="text"
                  name="username"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="用户名"
                  autoComplete="username"
                  className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
                />
              </div>
            </div>
          ) : null}

          {/* 手机号 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
              <DeviceMobile size={18} className="text-[#9BAE97]" />
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="手机号"
                autoComplete="tel"
                className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
              />
            </div>
          </div>

          {/* 密码 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
              <Lock size={18} className="text-[#9BAE97]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="密码"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#9BAE97]"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 提交按钮：type="submit" 触发浏览器密码管理器保存 */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#5EBF3F] text-[14px] font-semibold text-white active:opacity-80 disabled:opacity-60"
          >
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册并进入"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#9BAE97]">
          记录已发生的生活，从这一刻开始
        </p>
        <p className="mt-3 text-center text-[13px] text-[#9BAE97]">
          {mode === "login" ? "还没有账号？" : "已有账号？"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-medium text-[#5EBF3F]"
          >
            {mode === "login" ? "去注册" : "去登录"}
          </button>
        </p>
      </div>
    </div>
  );
}
