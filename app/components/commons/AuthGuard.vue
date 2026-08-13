<script setup lang="ts">
/**
 * @component AuthGuard
 * @description 客户端鉴权守卫组件，负责所有受保护路由的鉴权
 * 在客户端检查 localStorage 和 Cookie 中的 session token：
 * - 有 token：正常渲染子组件
 * - 无 token：跳转到登录页（带 sessionStorage 防抖）
 * @author gouxinjie
 * @created 2026-08-10
 */

import { getSessionToken } from "@/services/api-client";

/** sessionStorage key，用于重定向防抖 */
const REDIRECT_GUARD_KEY = "auth_redirect_ts";
/** 重定向防抖间隔（毫秒），3 秒内同一页面不重复重定向 */
const REDIRECT_COOLDOWN_MS = 3000;

/** 是否处于服务端渲染阶段 */
const isServer = import.meta.server;

onMounted(() => {
  const token = getSessionToken();
  if (token) {
    return;
  }

  // sessionStorage 防抖
  try {
    const lastRedirect = sessionStorage.getItem(REDIRECT_GUARD_KEY);
    if (lastRedirect && Date.now() - Number(lastRedirect) < REDIRECT_COOLDOWN_MS) {
      return;
    }
    sessionStorage.setItem(REDIRECT_GUARD_KEY, String(Date.now()));
  } catch {
    // sessionStorage 不可用时静默失败
  }

  // localStorage 和 Cookie 均无 token，跳转到登录页
  window.location.replace("/login");
});
</script>

<template>
  <!--
    SSR 阶段渲染稳定占位，避免在服务端输出受保护页面内容（防内容闪现/泄露）；
    客户端挂载后由 onMounted 鉴权并跳转。SSR/CSR 首屏 DOM 结构一致，规避 hydration mismatch。
  -->
  <div v-if="isServer" class="flex min-h-[100dvh] items-center justify-center">
    <span class="text-[13px] text-[#82918B]">加载中...</span>
  </div>
  <slot v-else />
</template>