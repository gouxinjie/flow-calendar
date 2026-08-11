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
    <header class="px-5 pb-4 pt-5">
      <h1 class="text-[26px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">我的</h1>
      <p class="mt-1 text-[13px] text-[#82918B]">账号、标签和同步状态</p>
    </header>

    <div class="flex-1 overflow-y-auto px-5 pb-6">
      <StateBanner v-if="feedback" tone="error" :message="feedback" class="mb-4" />
      <StateBanner v-if="pageError" tone="error" :message="pageError" class="mb-4" />

      <SectionCard v-if="loading" class="mb-4 h-[110px] animate-pulse bg-white/70" />
      <SectionCard v-else-if="profile" class="mb-4 flex items-center gap-4 p-5">
        <div
          class="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#55B936] to-[#2F8E2E] text-[22px] font-semibold text-white shadow-[0_6px_16px_rgba(63,150,40,0.25)]"
        >
          {{ profile.name.charAt(0) }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-[17px] font-semibold text-[#1F2A2A]">{{ profile.name }}</h2>
          <p class="mt-1 text-[13px] text-[#82918B]">{{ profile.phone }}</p>
        </div>
      </SectionCard>
      <EmptyState v-else title="暂时读取不到账号信息" description="请刷新页面重试。" />

      <!-- 功能入口 -->
      <SectionCard class="mb-4 p-2">
        <div class="flex flex-col">
          <NuxtLink
            to="/tags"
            class="flex items-center gap-3.5 rounded-[14px] px-3 py-3 transition-colors active:bg-[#EEF2EC]"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#EAF6E4] text-[#2F8E2E]">
              <BaseIcon name="tag-simple" :size="21" :weight="'regular'" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] font-medium text-[#1F2A2A]">标签管理</p>
              <p class="mt-0.5 text-[12px] text-[#82918B]">整理颜色、顺序与启用状态</p>
            </div>
            <BaseIcon name="caret-right" :size="16" class="shrink-0 text-[#AAB5B0]" />
          </NuxtLink>

          <NuxtLink
            to="/account"
            class="flex items-center gap-3.5 rounded-[14px] px-3 py-3 transition-colors active:bg-[#EEF2EC]"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#E6F1FA] text-[#3D8BC9]">
              <BaseIcon name="user" :size="21" :weight="'regular'" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] font-medium text-[#1F2A2A]">账号与安全</p>
              <p class="mt-0.5 text-[12px] text-[#82918B]">查看用户名、手机号和基础资料</p>
            </div>
            <BaseIcon name="caret-right" :size="16" class="shrink-0 text-[#AAB5B0]" />
          </NuxtLink>
        </div>
      </SectionCard>

      <SectionCard class="mb-4">
        <div class="flex items-start gap-3.5">
          <div class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#FDF1E3] text-[#D97E18]">
            <BaseIcon name="arrows-clockwise" :size="21" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="mb-1 text-[15px] font-medium text-[#1F2A2A]">同步状态</h3>
            <p class="text-[13px] leading-6 text-[#5C6B66]">
              当前版本以服务端数据为主，登录后新增、编辑和删除都会直接写入数据库。
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div class="flex items-start gap-3.5">
          <div class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#EFEDFB] text-[#6E6DCF]">
            <BaseIcon name="info" :size="21" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="mb-1 text-[15px] font-medium text-[#1F2A2A]">关于 青柠日历</h3>
            <p class="text-[13px] leading-6 text-[#5C6B66]">
              这是一个以月历为核心的轻量记录工具，重点不是规划未来，而是回看已经发生过的生活。
            </p>
          </div>
        </div>
      </SectionCard>

      <button
        type="button"
        class="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-[#D85A5A]/25 bg-white py-[14px] text-[14px] font-medium text-[#D85A5A] transition-colors active:bg-[#FFF5F5]"
        @click="handleLogout"
      >
        <BaseIcon name="sign-out" :size="16" />
        退出登录
      </button>
    </div>
  </div>
</template>
