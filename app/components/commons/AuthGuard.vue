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

const authChecked = ref(false);
const isAuthenticated = ref(false);

onMounted(() => {
  const token = getSessionToken();
  if (token) {
    isAuthenticated.value = true;
    authChecked.value = true;
    return;
  }

  // sessionStorage 防抖
  try {
    const lastRedirect = sessionStorage.getItem(REDIRECT_GUARD_KEY);
    if (lastRedirect && Date.now() - Number(lastRedirect) < REDIRECT_COOLDOWN_MS) {
      authChecked.value = true;
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
  <slot v-if="authChecked && isAuthenticated" />
</template>
