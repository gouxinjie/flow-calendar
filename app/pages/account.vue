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

    <div class="flex-1 overflow-y-auto px-4 pb-4 pt-2">
      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-4" />

      <SectionCard class="mb-4">
        <h3 class="mb-4 text-[13px] font-semibold text-[#9BAE97]">基本资料</h3>

        <div class="mb-5 flex items-center gap-3">
          <div
            class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E3F5DA] text-[20px] font-semibold text-[#5EBF3F] shadow-[0_2px_8px_rgba(94,191,63,0.15)]"
          >
            {{ profile?.name?.charAt(0) ?? "F" }}
          </div>
          <div>
            <p class="text-[15px] text-[#1F2A2A]">
              {{ loading ? "读取中…" : profile?.name ?? "未命名用户" }}
            </p>
            <p class="mt-0.5 text-[12px] text-[#9BAE97]">暂不支持自定义头像</p>
          </div>
        </div>

        <label class="mb-2 block text-[13px] text-[#6B7A7A]">用户名</label>
        <input
          v-model="name"
          type="text"
          placeholder="请输入用户名"
          class="mb-4 w-full rounded-[16px] border border-[#DCEAD2] bg-white px-4 py-3 text-[14px] text-[#1F2A2A] outline-none transition-colors placeholder:text-[#BFC7C3] focus:border-[#5EBF3F] focus:ring-1 focus:ring-[#5EBF3F]/20"
        />

        <label class="mb-2 block text-[13px] text-[#6B7A7A]">手机号</label>
        <input
          v-model="phone"
          type="tel"
          readonly
          placeholder="暂不可修改"
          class="w-full rounded-[16px] border border-[#DCEAD2] bg-[#F3FAF7] px-4 py-3 text-[14px] text-[#7C8A87] outline-none"
        />
      </SectionCard>

      <SectionCard class="mb-4">
        <h3 class="mb-3 text-[13px] font-semibold text-[#9BAE97]">联系信息</h3>

        <div class="flex items-center gap-3 rounded-[16px] bg-[#F3FAF7] px-4 py-3">
          <BaseIcon name="phone" :size="16" class="shrink-0 text-[#9BAE97]" />
          <div class="min-w-0 flex-1">
            <p class="text-[12px] text-[#8EA094]">手机号</p>
            <p class="text-[14px] text-[#1F2A2A]">{{ profile?.phone ?? "—" }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-3 rounded-[16px] bg-[#F3FAF7] px-4 py-3">
          <BaseIcon name="envelope" :size="16" class="shrink-0 text-[#9BAE97]" />
          <div class="min-w-0 flex-1">
            <p class="text-[12px] text-[#8EA094]">邮箱</p>
            <p class="text-[14px] text-[#7C8A87]">{{ profile?.email ?? "未填写" }}</p>
          </div>
        </div>
      </SectionCard>

      <button
        type="button"
        :disabled="saving || loading"
        class="w-full rounded-[16px] bg-[#5EBF3F] py-3.5 text-[14px] font-semibold text-white transition-colors active:bg-[#4DAB30] disabled:opacity-50"
        @click="handleSave"
      >
        {{ saving ? "保存中…" : "保存修改" }}
      </button>
    </div>
  </div>
</template>
