<script setup lang="ts">
/**
 * @page LoginPage
 * @description 登录/注册页，客户端表单与交互逻辑
 * @author gouxinjie
 * @created 2026-08-10
 */

import type { ApiResponse, AuthSessionData } from "@/types/models";
import { saveSessionToken } from "@/services/api-client";

definePageMeta({
  layout: false,
});

/** 会话 Cookie 名称，与服务端保持一致 */
const SESSION_COOKIE = "lime_calendar_session";

const mode = ref<"login" | "register">("login");
const name = ref("");
const phone = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const notice = ref<{ tone: "error" | "success"; message: string } | null>(null);

/** 夸克浏览器兜底：客户端手动设置 session cookie */
function setClientSessionCookie(token: string): void {
  try {
    document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } catch {
    // 静默失败
  }
}

/** 提交登录/注册 */
async function handleSubmit() {
  if (mode.value === "register" && !name.value.trim()) {
    notice.value = { tone: "error", message: "请输入用户名" };
    return;
  }

  if (!phone.value.trim() || !password.value) {
    notice.value = { tone: "error", message: "请输入手机号和密码" };
    return;
  }

  // 前端校验手机号格式
  if (!/^1\d{10}$/.test(phone.value.trim())) {
    notice.value = { tone: "error", message: "请输入 11 位手机号" };
    return;
  }

  // 注册模式：前端校验密码最小长度
  if (mode.value === "register" && password.value.length < 6) {
    notice.value = { tone: "error", message: "密码至少 6 位" };
    return;
  }

  notice.value = null;
  loading.value = true;

  try {
    const endpoint = mode.value === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(mode.value === "register" ? { name: name.value.trim() } : {}),
        phone: phone.value.trim(),
        password: password.value,
      }),
    });

    const payload: ApiResponse<AuthSessionData> = await response.json();

    if (!payload.success) {
      throw new Error(payload.message);
    }

    // 夸克浏览器兜底：客户端手动写入 session cookie 和 localStorage
    if (payload.data?.sessionToken) {
      setClientSessionCookie(payload.data.sessionToken);
      saveSessionToken(payload.data.sessionToken);
    }

    notice.value = {
      tone: "success",
      message: mode.value === "login" ? "登录成功，正在进入月历页" : "注册成功，正在进入月历页",
    };

    // localStorage 已同步写入，直接跳转即可
    window.location.href = "/calendar";
  } catch (requestError) {
    const message = requestError instanceof Error ? requestError.message : "操作失败";
    notice.value = { tone: "error", message };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFFFFF] px-6">
    <div class="animate-page-enter w-full max-w-[380px]">
      <div class="mb-8 text-center">
        <img src="/qingning.svg" alt="青柠日历" class="mx-auto mb-4 h-14 w-14" />
        <h1 class="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">青柠日历</h1>
        <p class="mt-1.5 text-[14px] text-[#82918B]">记录已发生的生活，留在月历上</p>
      </div>

      <!-- 登录/注册切换 -->
      <div class="mb-6 grid grid-cols-2 rounded-full bg-[#EEF2EC] p-1">
        <button
          type="button"
          :class="[
            'rounded-full px-3 py-2 text-[14px] font-medium transition-colors',
            mode === 'login' ? 'bg-white text-[#1F2A2A] shadow-sm' : 'text-[#5C6B66]',
          ]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          type="button"
          :class="[
            'rounded-full px-3 py-2 text-[14px] font-medium transition-colors',
            mode === 'register' ? 'bg-white text-[#1F2A2A] shadow-sm' : 'text-[#5C6B66]',
          ]"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-4" />

      <!-- 使用 <form> 让浏览器密码管理器识别并自动填充 -->
      <form @submit.prevent="handleSubmit">
        <div v-if="mode === 'register'" class="mb-3">
          <div class="flex items-center gap-2.5 rounded-[14px] border border-[#E5F0DB] bg-white px-4 py-3 transition-colors focus-within:border-[#55B936]/70 focus-within:ring-2 focus-within:ring-[#55B936]/10">
            <input
              v-model="name"
              type="text"
              name="username"
              placeholder="用户名"
              autocomplete="username"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#AAB5B0] outline-none"
            />
          </div>
        </div>

        <!-- 手机号 -->
        <div class="mb-3">
          <div class="flex items-center gap-2.5 rounded-[14px] border border-[#E5F0DB] bg-white px-4 py-3 transition-colors focus-within:border-[#55B936]/70 focus-within:ring-2 focus-within:ring-[#55B936]/10">
            <BaseIcon name="device-mobile" :size="18" class="text-[#AAB5B0]" />
            <input
              v-model="phone"
              type="tel"
              name="phone"
              placeholder="手机号"
              autocomplete="tel"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#AAB5B0] outline-none"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div class="mb-6">
          <div class="flex items-center gap-2.5 rounded-[14px] border border-[#E5F0DB] bg-white px-4 py-3 transition-colors focus-within:border-[#55B936]/70 focus-within:ring-2 focus-within:ring-[#55B936]/10">
            <BaseIcon name="lock" :size="18" class="text-[#AAB5B0]" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              placeholder="密码"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#AAB5B0] outline-none"
            />
            <button
              type="button"
              class="text-[#AAB5B0]"
              @click="showPassword = !showPassword"
            >
              <BaseIcon :name="showPassword ? 'eye-slash' : 'eye'" :size="18" />
            </button>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          :disabled="loading"
          class="flex h-[50px] w-full items-center justify-center rounded-full bg-[#55B936] text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(85,185,54,0.2)] transition-all active:scale-[0.98] active:opacity-90 disabled:opacity-60"
        >
          {{ loading ? "处理中..." : mode === "login" ? "登录" : "注册并进入" }}
        </button>
      </form>

      <p class="mt-6 text-center text-[13px] text-[#AAB5B0]">记录已发生的生活，从这一刻开始</p>
      <p class="mt-3 text-center text-[13px] text-[#AAB5B0]">
        {{ mode === "login" ? "还没有账号？" : "已有账号？" }}
        <button
          type="button"
          class="font-medium text-[#55B936]"
          @click="mode = mode === 'login' ? 'register' : 'login'"
        >
          {{ mode === "login" ? "去注册" : "去登录" }}
        </button>
      </p>
    </div>
  </div>
</template>
