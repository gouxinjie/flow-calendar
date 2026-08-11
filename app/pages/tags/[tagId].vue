<script setup lang="ts">
/**
 * @page EditTagPage
 * @description 编辑标签页
 * @author gouxinjie
 * @created 2026-08-10
 */

import { cn } from "@/utils/cn";
import { TAG_CATEGORY_OPTIONS, TAG_COLOR_OPTIONS, resolveTagToneByColor } from "@/utils/tag-presets";
import { TAG_COLOR_MAP } from "@/types/models";
import { requestApi } from "@/services/api-client";
import type { ActivityTag, TagCategory, TagColorTone } from "@/types/models";

definePageMeta({
  layout: "main",
});

const route = useRoute();
const router = useRouter();
const tagId = route.params.tagId as string;

const name = ref("");
const selectedColor = ref<TagColorTone>("green");
const selectedCategory = ref<TagCategory>("other");
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const showDeleteConfirm = ref(false);
const notice = ref<{ tone: "error" | "success"; message: string } | null>(null);

/** 加载标签 */
async function loadTags() {
  loading.value = true;

  try {
    const tags = await requestApi<ActivityTag[]>("/api/tags");
    const currentTag = tags.find((tag) => tag.id === tagId);

    if (!currentTag) {
      notice.value = { tone: "error", message: "标签不存在" };
      return;
    }

    name.value = currentTag.name;
    selectedCategory.value = (currentTag.category as TagCategory | null) ?? "other";
    selectedColor.value = resolveTagToneByColor(currentTag.color);
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "读取标签失败",
    };
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadTags();
});

/** 保存 */
async function handleSave() {
  saving.value = true;
  notice.value = null;

  try {
    await requestApi<ActivityTag>(`/api/tags/${tagId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: name.value.trim(),
        color: TAG_COLOR_MAP[selectedColor.value].border,
        category: selectedCategory.value,
      }),
    });

    router.push("/tags");
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "保存标签失败",
    };
  } finally {
    saving.value = false;
  }
}

/** 删除 */
async function handleDelete() {
  deleting.value = true;
  notice.value = null;

  try {
    await requestApi<null>(`/api/tags/${tagId}`, {
      method: "DELETE",
      body: JSON.stringify({}),
    });

    router.push("/tags");
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "删除标签失败",
    };
    deleting.value = false;
    showDeleteConfirm.value = false;
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <ScreenHeader title="编辑标签" back-href="/tags" />

    <div class="flex-1 overflow-y-auto px-5 pb-5 pt-1">
      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-4" />

      <div class="surface-card flex flex-col gap-5 p-4">
        <div>
          <label class="mb-1.5 block text-[13px] font-medium text-[#5C6B66]">标签名称 *</label>
          <input
            v-model="name"
            type="text"
            placeholder="如：跑步、阅读、聚会"
            maxlength="10"
            :disabled="loading"
            class="w-full rounded-[12px] border border-[#E5F0DB] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none transition-colors focus:border-[#55B936]/70 focus:ring-2 focus:ring-[#55B936]/10"
          />
        </div>

        <div>
          <label class="mb-2 block text-[13px] font-medium text-[#5C6B66]">颜色</label>
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
              <span class="text-[11px] text-[#5C6B66]">{{ label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-[13px] font-medium text-[#5C6B66]">分类</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="{ value, label } in TAG_CATEGORY_OPTIONS"
              :key="value"
              type="button"
              :class="[
                'rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
                selectedCategory === value ? 'bg-[#55B936] text-white' : 'bg-[#EEF7EA] text-[#5C6B66] active:bg-[#E5F0DB]',
              ]"
              @click="selectedCategory = value"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <button
          type="button"
          :disabled="loading"
          class="mt-1 w-full rounded-full border border-[#D85A5A]/30 py-3 text-[14px] font-medium text-[#D85A5A] transition-colors active:bg-[#FFF5F5]"
          @click="showDeleteConfirm = true"
        >
          删除标签
        </button>
      </div>
    </div>

    <div class="shrink-0 px-5 pb-4 safe-pb">
      <button
        type="button"
        :disabled="!name.trim() || saving || loading"
        :class="cn(
          'flex h-[50px] w-full items-center justify-center rounded-full text-[14px] font-semibold text-white transition-all',
          name.trim() && !saving && !loading ? 'bg-[#55B936] active:scale-[0.98]' : 'bg-[#AAB5B0] cursor-not-allowed',
        )"
        @click="handleSave"
      >
        {{ saving ? "保存中…" : "保存" }}
      </button>
    </div>

    <ConfirmSheet
      :open="showDeleteConfirm"
      title="删除这个标签？"
      description="删除后，原来关联这个标签的记录会变为未分类。"
      :loading="deleting"
      @confirm="void handleDelete()"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
