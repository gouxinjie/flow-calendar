"use client";

/**
 * @component LoginPageClient
 * @description 登录页客户端表单与交互逻辑
 * 客户端启动时检查 Cookie，若已有 session 则直接跳转到月历页，
 * 避免依赖服务端 RSC 请求携带 Cookie（夸克浏览器不携带）。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import { useEffect, useState } from "react";
import { Envelope, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

import { StateBanner } from "@/components/commons/state-banner";

import { saveSessionToken, getSessionToken } from "@/services/api-client";
import type { ApiResponse } from "@/types/models";

/** 会话 Cookie 名称，与服务端保持一致 */
const SESSION_COOKIE = "flow_calendar_session";

/** 登录响应 data 类型 */
interface LoginData {
  id: string;
  name: string;
  email: string;
  sessionToken: string;
}

/**
 * @description 从 document.cookie 或 localStorage 中读取 session token
 * 同时检查 Cookie 和 localStorage，确保夸克浏览器环境下也能检测到已登录状态
 * @deprecated 请使用 @/services/api-client 中的 getSessionToken
 */
function getSessionTokenFromClient(): string | null {
  return getSessionToken();
}

/**
 * @description 夸克浏览器兜底：客户端手动设置 session cookie
 * 夸克浏览器可能不处理 fetch 响应中的 httpOnly Set-Cookie，
 * 这里用非 httpOnly cookie 做兜底写入
 */
function setClientSessionCookie(userId: string): void {
  try {
    document.cookie = `${SESSION_COOKIE}=${userId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } catch {
    // 静默失败，不影响主流程
  }
}

export function LoginPageClient() {
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  // 客户端检查是否已有 session token（Cookie 或 localStorage），有则直接跳转月历页
  // 夸克浏览器在 RSC 请求中不携带 Cookie，服务端无法做 redirect，
  // 因此改为客户端兜底检查。
  // 使用 window.location.replace 而非 router.replace，
  // 避免 Next.js 路由尚未初始化完成时抛出 "Router action dispatched before initialization" 错误
  useEffect(() => {
    const sessionToken = getSessionTokenFromClient();
    if (sessionToken) {
      window.location.replace("/calendar");
      return;
    }
    setChecking(false);
  }, []);

  const handleSubmit = async () => {
    if (mode === "register" && !name.trim()) {
      setNotice({ tone: "error", message: "请输入用户名" });
      return;
    }

    if (!email.trim() || !password) {
      setNotice({ tone: "error", message: "请输入邮箱和密码" });
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
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload: ApiResponse<LoginData> = await response.json();

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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F7FAF9] px-6">
      {/* 检查登录状态时显示加载提示，防止 JS 加载失败时完全空白 */}
      {checking ? (
        <p className="text-[#A8B8B0] text-[14px] animate-pulse">加载中...</p>
      ) : (
        <>
          {/* Logo / 品牌区 */}
          <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#D6ECE6] bg-white shadow-[0_24px_50px_rgba(34,195,166,0.12)]">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="8" width="28" height="24" rx="4" stroke="#22C3A6" strokeWidth="2" fill="white" />
            <line x1="4" y1="16" x2="32" y2="16" stroke="#22C3A6" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="#22C3A6" strokeWidth="2" />
            <line x1="24" y1="8" x2="24" y2="12" stroke="#22C3A6" strokeWidth="2" />
            <circle cx="12" cy="21" r="2" fill="#22C3A6" />
            <circle cx="20" cy="21" r="2" fill="#FF9F43" />
            <circle cx="16" cy="26" r="1.5" fill="#5DA9E9" />
            <circle cx="22" cy="26" r="1.5" fill="#8B8AEF" />
          </svg>
        </div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">
          Flow Calendar
        </h1>
        <p className="mt-2 text-[14px] text-[#A8B8B0]">
          记录已发生的生活，留在月历上
        </p>
      </div>

      {/* 登录表单 */}
      <div className="surface-card w-full max-w-[360px] p-5">
        <div className="mb-5 grid grid-cols-2 rounded-[16px] bg-[#F2F7F5] p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-[12px] px-3 py-2 text-[14px] font-medium ${
              mode === "login" ? "bg-white text-[#1F2A2A] shadow-sm" : "text-[#6B7A7A]"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-[12px] px-3 py-2 text-[14px] font-medium ${
              mode === "register" ? "bg-white text-[#1F2A2A] shadow-sm" : "text-[#6B7A7A]"
            }`}
          >
            注册
          </button>
        </div>

        {notice ? (
          <StateBanner tone={notice.tone} message={notice.message} className="mb-4" />
        ) : null}

        {mode === "register" ? (
          <div className="mb-3">
            <div className="flex items-center gap-2 rounded-[14px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="用户名"
                className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none"
              />
            </div>
          </div>
        ) : null}

        {/* 邮箱 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
            <Envelope size={18} className="text-[#A8B8B0]" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="邮箱地址"
              className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none"
            />
          </div>
        </div>

        {/* 密码 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
            <Lock size={18} className="text-[#A8B8B0]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="密码"
              className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none"
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#A8B8B0]"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#22C3A6] text-[14px] font-semibold text-white active:opacity-80 disabled:opacity-60"
        >
          {loading ? "处理中..." : mode === "login" ? "登录" : "注册并进入"}
        </button>

        <p className="mt-6 text-center text-[13px] text-[#A8B8B0]">
          记录已发生的生活，从这一刻开始
        </p>
        <p className="mt-3 text-center text-[13px] text-[#A8B8B0]">
          {mode === "login" ? "还没有账号？" : "已有账号？"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-medium text-[#22C3A6]"
          >
            {mode === "login" ? "去注册" : "去登录"}
          </button>
        </p>
          </div>
        </>
      )}
    </div>
  );
}
