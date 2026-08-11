<script setup lang="ts">
/**
 * @page MePage
 * @description 我的页 - 用户资料、标签入口与同步说明
 * @author gouxinjie
 * @created 2026-08-10
 */

import { requestApi, clearSessionToken } from "@/services/api-client";
import type { UserProfile } from "@/types/models";

definePageMeta({
  layout: "main",
});

const profile = ref<UserProfile | null>(null);
const loading = ref(true);
const pageError = ref("");
const feedback = ref("");

/** 加载用户资料 */
async function loadProfile() {
  loading.value = true;
  pageError.value = "";

  try {
    const nextProfile = await requestApi<UserProfile>("/api/account");
    profile.value = nextProfile;
  } catch (requestError) {
    pageError.value = requestError instanceof Error ? requestError.message : "读取账号信息失败";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadProfile();
});

/** 退出登录 */
async function handleLogout() {
  try {
    await requestApi<null>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    document.cookie = "lime_calendar_session=; path=/; max-age=0; SameSite=Lax";
    clearSessionToken();
    window.location.href = "/login";
  } catch (requestError) {
    feedback.value = requestError instanceof Error ? requestError.message : "退出失败";
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="px-4 pb-3 pt-5">
      <h1 class="text-[22px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">我的</h1>
      <p class="mt-1.5 text-[13px] text-[#7C8A87]">账号、标签和同步状态</p>
    </header>

    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <StateBanner v-if="feedback" tone="error" :message="feedback" class="mb-4" />
      <StateBanner v-if="pageError" tone="error" :message="pageError" class="mb-4" />

      <SectionCard v-if="loading" class="mb-4 h-[110px] animate-pulse bg-white/70" />
      <SectionCard v-else-if="profile" class="mb-4 flex items-center gap-4">
        <div
          class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E3F5DA] text-[20px] font-semibold text-[#5EBF3F] shadow-[0_2px_8px_rgba(94,191,63,0.15)]"
        >
          {{ profile.name.charAt(0) }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-[17px] font-semibold text-[#1F2A2A]">{{ profile.name }}</h2>
          <p class="mt-0.5 text-[13px] text-[#7C8A87]">{{ profile.phone }}</p>
        </div>
      </SectionCard>
      <EmptyState v-else title="暂时读取不到账号信息" description="请刷新页面重试。" />

      <SectionCard class="mb-4">
        <div class="divide-y divide-[#F0F5F3]">
          <NuxtLink to="/tags" class="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 active:opacity-70">
            <div class="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E3F5DA] text-[#5EBF3F]">
              <BaseIcon name="tag-simple" :size="20" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] text-[#1F2A2A]">标签管理</p>
              <p class="text-[12px] text-[#8EA094]">整理颜色、顺序与启用状态</p>
            </div>
            <BaseIcon name="caret-right" :size="16" class="shrink-0 text-[#C5D6CC]" />
          </NuxtLink>

          <NuxtLink to="/account" class="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 active:opacity-70">
            <div class="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E3F5DA] text-[#5EBF3F]">
              <BaseIcon name="user" :size="20" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] text-[#1F2A2A]">账号与安全</p>
              <p class="text-[12px] text-[#8EA094]">查看用户名、手机号和基础资料</p>
            </div>
            <BaseIcon name="caret-right" :size="16" class="shrink-0 text-[#C5D6CC]" />
          </NuxtLink>
        </div>
      </SectionCard>

      <SectionCard class="mb-4">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF4E8] text-[#FF9F43]">
            <BaseIcon name="arrows-clockwise" :size="20" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="mb-0.5 text-[15px] text-[#1F2A2A]">同步状态</h3>
            <p class="text-[13px] leading-6 text-[#6B7A7A]">
              当前版本以服务端数据为主，登录后新增、编辑和删除都会直接写入数据库。
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F0EEFA] text-[#8B8AEF]">
            <BaseIcon name="info" :size="20" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="mb-0.5 text-[15px] text-[#1F2A2A]">关于 青柠日历</h3>
            <p class="text-[13px] leading-6 text-[#6B7A7A]">
              这是一个以月历为核心的轻量记录工具，重点不是规划未来，而是回看已经发生过的生活。
            </p>
          </div>
        </div>
      </SectionCard>

      <button
        type="button"
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#F0E4E4] bg-white py-[13px] text-[14px] text-[#D85A5A] transition-colors active:bg-[#FFF5F5]"
        @click="handleLogout"
      >
        <BaseIcon name="sign-out" :size="16" />
        退出登录
      </button>
    </div>
  </div>
</template>
