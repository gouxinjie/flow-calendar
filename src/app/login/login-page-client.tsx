"use client";

/**
 * @component LoginPageClient
 * @description 登录页客户端表单与交互逻辑
 * 客户端启动时检查 Cookie，若已有 session 则直接跳转到月历页，
 * 避免依赖服务端 RSC 请求携带 Cookie（夸克浏览器不携带）。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01
 */
import { useEffect, useState } from "react";
import { DeviceMobile, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

import { StateBanner } from "@/components/commons/state-banner";

import { saveSessionToken, getSessionToken } from "@/services/api-client";
import type { ApiResponse } from "@/types/models";

/** 会话 Cookie 名称，与服务端保持一致 */
const SESSION_COOKIE = "flow_calendar_session";

/** 登录响应 data 类型 */
interface LoginData {
  id: string;
  name: string;
  phone: string;
  sessionToken: string;
}

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

  // 后台静默检查登录状态，已登录则直接跳转月历页
  // 不阻塞表单渲染，避免 JS 加载慢时一直显示"加载中..."
  // 使用 window.location.replace 而非 router.replace，
  // 避免 Next.js 路由尚未初始化完成时抛出 "Router action dispatched before initialization" 错误
  useEffect(() => {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      window.location.replace("/calendar");
    }
  }, []);

  const handleSubmit = async () => {
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f1f9f6] px-6">
      {/* Logo / 品牌区 */}
      <div className="animate-page-enter w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">
            Flow Calendar
          </h1>
          <p className="mt-2 text-[14px] text-[#A8B8B0]">
            记录已发生的生活，留在月历上
          </p>
        </div>

        {/* 登录/注册切换 */}
        <div className="mb-6 grid grid-cols-2 rounded-[10px] bg-[#EDF3F1] p-1">
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

        {mode === "register" ? (
          <div className="mb-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
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

        {/* 手机号 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
            <DeviceMobile size={18} className="text-[#A8B8B0]" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="手机号"
              autoComplete="tel"
              className="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none"
            />
          </div>
        </div>

        {/* 密码 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE7E4] bg-white px-4 py-3 focus-within:border-[#22C3A6]">
            <Lock size={18} className="text-[#A8B8B0]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="密码"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
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
          className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#22C3A6] text-[14px] font-semibold text-white active:opacity-80 disabled:opacity-60"
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
    </div>
  );
}
