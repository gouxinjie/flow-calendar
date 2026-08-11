<script setup lang="ts">
/**
 * @page NewTagPage
 * @description 新建标签页
 * @author gouxinjie
 * @created 2026-08-10
 */

import { cn } from "@/utils/cn";
import { TAG_CATEGORY_OPTIONS, TAG_COLOR_OPTIONS } from "@/utils/tag-presets";
import { TAG_COLOR_MAP } from "@/types/models";
import { requestApi } from "@/services/api-client";
import type { ActivityTag, TagCategory, TagColorTone } from "@/types/models";

definePageMeta({
  layout: "main",
});

const router = useRouter();
const name = ref("");
const selectedColor = ref<TagColorTone>("green");
const selectedCategory = ref<TagCategory>("other");
const saving = ref(false);
const notice = ref("");

/** 保存标签 */
async function handleSave() {
  saving.value = true;
  notice.value = "";

  try {
    await requestApi<ActivityTag>("/api/tags", {
      method: "POST",
      body: JSON.stringify({
        name: name.value.trim(),
        color: TAG_COLOR_MAP[selectedColor.value].border,
        category: selectedCategory.value,
      }),
    });

    router.push("/tags");
  } catch (requestError) {
    notice.value = requestError instanceof Error ? requestError.message : "创建标签失败";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <ScreenHeader title="新建标签" back-href="/tags" />

    <div class="flex-1 overflow-y-auto px-4 pb-4 pt-2">
      <StateBanner v-if="notice" tone="error" :message="notice" class="mb-4" />

      <div class="surface-card flex flex-col gap-5 p-4">
        <div>
          <label class="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">标签名称 *</label>
          <input
            v-model="name"
            type="text"
            placeholder="如：跑步、阅读、聚会"
            maxlength="10"
            class="w-full rounded-[14px] border border-[#DCEAD2] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#5EBF3F]"
          />
        </div>

        <div>
          <label class="mb-2 block text-[13px] font-medium text-[#6B7A7A]">颜色</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="{ tone, label } in TAG_COLOR_OPTIONS"
              :key="tone"
              type="button"
              class="flex flex-col items-center gap-1"
              @click="selectedColor = tone"
            >
              <span
                :class="[
                  'h-10 w-10 rounded-full border-2 transition-colors',
                  selectedColor === tone ? 'border-[#1F2A2A]' : 'border-transparent',
                ]"
                :style="{ backgroundColor: TAG_COLOR_MAP[tone].border }"
              />
              <span class="text-[11px] text-[#6B7A7A]">{{ label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-[13px] font-medium text-[#6B7A7A]">分类</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="{ value, label } in TAG_CATEGORY_OPTIONS"
              :key="value"
              type="button"
              :class="[
                'rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors',
                selectedCategory === value ? 'bg-[#5EBF3F] text-white' : 'bg-[#F4F9F1] text-[#6B7A7A]',
              ]"
              @click="selectedCategory = value"
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="shrink-0 px-4 pb-4 safe-pb">
      <button
        type="button"
        :disabled="!name.trim() || saving"
        :class="cn(
          'flex h-[48px] w-full items-center justify-center rounded-[14px] text-[14px] font-semibold text-white transition-opacity',
          name.trim() && !saving ? 'bg-[#5EBF3F]' : 'bg-[#9BAE97] cursor-not-allowed',
        )"
        @click="handleSave"
      >
        {{ saving ? "保存中…" : "保存" }}
      </button>
    </div>
  </div>
</template>
