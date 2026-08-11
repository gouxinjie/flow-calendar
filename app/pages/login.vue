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
  <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F3FAF7] px-6">
    <div class="animate-page-enter w-full max-w-[380px]">
      <div class="mb-8 text-center">
        <h1 class="flex items-center justify-center gap-2 text-[28px] font-semibold tracking-[-0.03em] text-[#5EBF3F]">
          <img src="/qingning.svg" alt="" class="h-[32px] w-[32px]" />
          青柠日历
        </h1>
        <p class="mt-2 text-[14px] text-[#6B7A7A]">记录已发生的生活，留在月历上</p>
      </div>

      <!-- 登录/注册切换 -->
      <div class="mb-6 grid grid-cols-2 rounded-[10px] bg-[#EDF5E9] p-1">
        <button
          type="button"
          :class="[
            'rounded-[8px] px-3 py-2 text-[14px] font-medium',
            mode === 'login' ? 'bg-white text-[#1F2A2A] shadow-sm' : 'text-[#6B7A7A]',
          ]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          type="button"
          :class="[
            'rounded-[8px] px-3 py-2 text-[14px] font-medium',
            mode === 'register' ? 'bg-white text-[#1F2A2A] shadow-sm' : 'text-[#6B7A7A]',
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
          <div class="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
            <input
              v-model="name"
              type="text"
              name="username"
              placeholder="用户名"
              autocomplete="username"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
            />
          </div>
        </div>

        <!-- 手机号 -->
        <div class="mb-3">
          <div class="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
            <BaseIcon name="device-mobile" :size="18" class="text-[#9BAE97]" />
            <input
              v-model="phone"
              type="tel"
              name="phone"
              placeholder="手机号"
              autocomplete="tel"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div class="mb-6">
          <div class="flex items-center gap-2 rounded-[10px] border border-[#DCEAD2] bg-white px-4 py-3 focus-within:border-[#5EBF3F]">
            <BaseIcon name="lock" :size="18" class="text-[#9BAE97]" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              placeholder="密码"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              class="flex-1 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none"
            />
            <button
              type="button"
              class="text-[#9BAE97]"
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
          class="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#5EBF3F] text-[14px] font-semibold text-white active:opacity-80 disabled:opacity-60"
        >
          {{ loading ? "处理中..." : mode === "login" ? "登录" : "注册并进入" }}
        </button>
      </form>

      <p class="mt-6 text-center text-[13px] text-[#9BAE97]">记录已发生的生活，从这一刻开始</p>
      <p class="mt-3 text-center text-[13px] text-[#9BAE97]">
        {{ mode === "login" ? "还没有账号？" : "已有账号？" }}
        <button
          type="button"
          class="font-medium text-[#5EBF3F]"
          @click="mode = mode === 'login' ? 'register' : 'login'"
        >
          {{ mode === "login" ? "去注册" : "去登录" }}
        </button>
      </p>
    </div>
  </div>
</template>
