<script setup lang="ts">
/**
 * @page AccountPage
 * @description 账号与安全页
 * @author gouxinjie
 * @created 2026-08-10
 */

import { requestApi } from "@/services/api-client";
import type { UserProfile } from "@/types/models";

definePageMeta({
  layout: "main",
});

const profile = ref<UserProfile | null>(null);
const name = ref("");
const phone = ref("");
const loading = ref(true);
const saving = ref(false);
const notice = ref<{ tone: "success" | "error"; message: string } | null>(null);

/** 加载用户资料 */
async function loadProfile() {
  loading.value = true;

  try {
    const nextProfile = await requestApi<UserProfile>("/api/account");
    profile.value = nextProfile;
    name.value = nextProfile.name;
    phone.value = nextProfile.phone ?? "";
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "读取账号信息失败",
    };
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadProfile();
});

/** 保存 */
async function handleSave() {
  saving.value = true;
  notice.value = null;

  try {
    const nextProfile = await requestApi<UserProfile>("/api/account", {
      method: "PUT",
      body: JSON.stringify({
        name: name.value.trim(),
        phone: phone.value.trim(),
      }),
    });

    profile.value = nextProfile;
    name.value = nextProfile.name;
    phone.value = nextProfile.phone ?? "";
    notice.value = { tone: "success", message: "资料已更新" };
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "保存失败",
    };
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <ScreenHeader title="账号与安全" back-href="/me" />

    <div class="page-px flex-1 overflow-y-auto pb-5 pt-1">
      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-4" />

      <SectionCard class="mb-4">
        <h3 class="mb-4 text-[13px] font-semibold text-[#82918B]">基本资料</h3>

        <div class="mb-5 flex items-center gap-3">
          <div
            class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#55B936] to-[#2F8E2E] text-[20px] font-semibold text-white shadow-[0_6px_16px_rgba(63,150,40,0.25)]"
          >
            {{ profile?.name?.charAt(0) ?? "F" }}
          </div>
          <div>
            <p class="text-[15px] text-[#1F2A2A]">
              {{ loading ? "读取中…" : profile?.name ?? "未命名用户" }}
            </p>
            <p class="mt-0.5 text-[12px] text-[#82918B]">暂不支持自定义头像</p>
          </div>
        </div>

        <label class="mb-2 block text-[13px] text-[#5C6B66]">用户名</label>
        <input
          v-model="name"
          type="text"
          placeholder="请输入用户名"
          class="mb-4 w-full rounded-[12px] border border-[#E5F0DB] bg-white px-4 py-3 text-[14px] text-[#1F2A2A] outline-none transition-colors placeholder:text-[#AAB5B0] focus:border-[#55B936]/70 focus:ring-2 focus:ring-[#55B936]/10"
        />

        <label class="mb-2 block text-[13px] text-[#5C6B66]">手机号</label>
        <input
          v-model="phone"
          type="tel"
          readonly
          placeholder="暂不可修改"
          class="w-full rounded-[12px] border border-[#E5F0DB] bg-[#F0F3EE] px-4 py-3 text-[14px] text-[#82918B] outline-none"
        />
      </SectionCard>

      <SectionCard class="mb-4">
        <h3 class="mb-3 text-[13px] font-semibold text-[#82918B]">联系信息</h3>

        <div class="flex items-center gap-3 rounded-[12px] bg-[#F0F3EE] px-4 py-3">
          <BaseIcon name="phone" :size="16" class="shrink-0 text-[#82918B]" />
          <div class="min-w-0 flex-1">
            <p class="text-[12px] text-[#82918B]">手机号</p>
            <p class="text-[14px] text-[#1F2A2A]">{{ profile?.phone ?? "—" }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-3 rounded-[12px] bg-[#F0F3EE] px-4 py-3">
          <BaseIcon name="envelope" :size="16" class="shrink-0 text-[#82918B]" />
          <div class="min-w-0 flex-1">
            <p class="text-[12px] text-[#82918B]">邮箱</p>
            <p class="text-[14px] text-[#82918B]">{{ profile?.email ?? "未填写" }}</p>
          </div>
        </div>
      </SectionCard>

      <button
        type="button"
        :disabled="saving || loading"
        class="w-full rounded-full bg-[#55B936] py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.98] active:bg-[#48A02F] disabled:opacity-50"
        @click="handleSave"
      >
        {{ saving ? "保存中…" : "保存修改" }}
      </button>
    </div>
  </div>
</template>
