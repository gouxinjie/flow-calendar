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
  <div class="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--bg-page)] px-6">
    <!-- 顶部品牌光晕，营造清透呼吸感 -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-[radial-gradient(ellipse_at_top,_rgba(85,185,54,0.10),_transparent_68%)]"
    />
    <!-- 底部点缀光斑 -->
    <div
      class="pointer-events-none absolute bottom-[-10%] right-[-20%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(93,169,233,0.08),_transparent_70%)]"
    />

    <div class="animate-page-enter relative z-10 w-full max-w-[380px]">
      <div class="mb-9 text-center">
        <!-- 品牌 Logo：光环 + 浮层卡片质感 -->
        <div class="relative mx-auto mb-5 h-[60px] w-[60px]">
          <div class="absolute inset-0 rounded-[20px] bg-[var(--brand)]/20 blur-xl" />
          <div class="absolute inset-0 animate-[logoFloat_4s_ease-in-out_infinite]">
            <img
              src="/qingning.svg"
              alt="青柠日历"
              class="h-[60px] w-[60px] rounded-[20px] shadow-[0_8px_20px_rgba(61,148,40,0.25)] ring-1 ring-white/60"
            />
          </div>
        </div>
        <h1 class="text-[26px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">青柠日历</h1>
        <p class="mt-2 text-[14px] text-[var(--text-muted)]">记录已发生的生活，留在月历上</p>
      </div>

      <!-- 登录/注册切换 -->
      <div class="mb-6 grid grid-cols-2 rounded-full bg-[var(--bg-muted)] p-1">
        <button
          type="button"
          :class="[
            'rounded-full px-3 py-2.5 text-[14px] font-medium transition-all duration-200',
            mode === 'login'
              ? 'bg-white text-[var(--text-primary)] shadow-[0_2px_8px_rgba(38,50,44,0.08)]'
              : 'text-[var(--text-secondary)]',
          ]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          type="button"
          :class="[
            'rounded-full px-3 py-2.5 text-[14px] font-medium transition-all duration-200',
            mode === 'register'
              ? 'bg-white text-[var(--text-primary)] shadow-[0_2px_8px_rgba(38,50,44,0.08)]'
              : 'text-[var(--text-secondary)]',
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
          <div class="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3.5 transition-all duration-200 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-ring)]">
            <BaseIcon name="user" :size="18" class="text-[var(--text-faint)]" />
            <input
              v-model="name"
              type="text"
              name="username"
              placeholder="用户名"
              autocomplete="username"
              class="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none"
            />
          </div>
        </div>

        <!-- 手机号 -->
        <div class="mb-3">
          <div class="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3.5 transition-all duration-200 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-ring)]">
            <BaseIcon name="device-mobile" :size="18" class="text-[var(--text-faint)]" />
            <input
              v-model="phone"
              type="tel"
              name="phone"
              placeholder="手机号"
              autocomplete="tel"
              class="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div class="mb-6">
          <div class="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3.5 transition-all duration-200 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand-ring)]">
            <BaseIcon name="lock" :size="18" class="text-[var(--text-faint)]" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              placeholder="密码"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              class="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none"
            />
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center text-[var(--text-faint)] transition-colors hover:text-[var(--text-secondary)]"
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
          class="relative flex h-[50px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#5DC23F] via-[var(--brand)] to-[var(--brand-deep)] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(61,148,40,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.97] active:shadow-[0_4px_12px_rgba(61,148,40,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <!-- 上光高亮层 -->
          <span class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
          <BaseIcon
            v-if="loading"
            name="arrows-clockwise"
            :size="18"
            class="animate-spin"
          />
          <span>{{ loading ? "处理中..." : mode === "login" ? "登录" : "注册并进入" }}</span>
        </button>
      </form>

      <p class="mt-7 text-center text-[13px] text-[var(--text-faint)]">记录已发生的生活，从这一刻开始</p>
      <p class="mt-3 text-center text-[13px] text-[var(--text-muted)]">
        {{ mode === "login" ? "还没有账号？" : "已有账号？" }}
        <button
          type="button"
          class="font-medium text-[var(--brand)]"
          @click="mode = mode === 'login' ? 'register' : 'login'"
        >
          {{ mode === "login" ? "去注册" : "去登录" }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Logo 轻柔浮动，赋予页面"轻运动"生命力 */
@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
