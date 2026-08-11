<script setup lang="ts">
/**
 * @page TagsPage
 * @description 标签管理页
 * @author gouxinjie
 * @created 2026-08-10
 */

import { requestApi } from "@/services/api-client";
import type { ActivityTag } from "@/types/models";

definePageMeta({
  layout: "main",
});

const tags = ref<ActivityTag[]>([]);
const loading = ref(true);
const notice = ref<{ tone: "success" | "error"; message: string } | null>(null);

/** 加载标签列表 */
async function loadTags() {
  loading.value = true;
  notice.value = null;

  try {
    const nextTags = await requestApi<ActivityTag[]>("/api/tags");
    tags.value = nextTags;
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

const enabledCount = computed(() => tags.value.filter((tag) => tag.enabled).length);

/** 切换标签启用状态 */
async function handleToggle(tag: ActivityTag) {
  try {
    const updatedTag = await requestApi<ActivityTag>(`/api/tags/${tag.id}`, {
      method: "PUT",
      body: JSON.stringify({ enabled: !tag.enabled }),
    });

    tags.value = tags.value.map((currentTag) =>
      currentTag.id === updatedTag.id ? updatedTag : currentTag,
    );
    notice.value = { tone: "success", message: `${updatedTag.name}已${updatedTag.enabled ? "启用" : "停用"}` };
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "更新标签失败",
    };
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <ScreenHeader title="标签管理" :subtitle="`${enabledCount} 个启用标签`" back-href="/me">
      <template #right>
        <NuxtLink
          to="/tags/new"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[#55B936] text-white shadow-[0_8px_18px_rgba(85,185,54,0.24)] transition-transform active:scale-[0.94]"
        >
          <BaseIcon name="plus" :size="18" />
        </NuxtLink>
      </template>
    </ScreenHeader>

    <div class="flex-1 overflow-y-auto px-5 pb-5 pt-1">
      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-4" />

      <SectionCard v-if="loading" class="h-[220px] animate-pulse bg-white/70" />
      <EmptyState
        v-else-if="tags.length === 0"
        title="还没有标签"
        description="创建一个标签，让月历中的记录更好找、更好看。"
      >
        <template #action>
          <NuxtLink
            to="/tags/new"
            class="rounded-full bg-[#55B936] px-4 py-2 text-[13px] font-semibold text-white"
          >
            新建标签
          </NuxtLink>
        </template>
      </EmptyState>
      <SectionCard v-else class="p-1.5">
        <div class="flex flex-col">
          <div
            v-for="(tag, index) in tags"
            :key="tag.id"
            class="flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors"
            :class="index > 0 && 'border-t border-[#EEF2EC]'"
          >
            <span class="h-9 w-9 shrink-0 rounded-[12px]" :style="{ backgroundColor: tag.color }" />

            <div class="min-w-0 flex-1">
              <p :class="['text-[15px] font-medium', tag.enabled ? 'text-[#1F2A2A]' : 'text-[#AAB5B0]']">
                {{ tag.name }}
              </p>
              <p class="mt-0.5 text-[12px] text-[#82918B]">
                排序 {{ tag.sortOrder }} · {{ tag.category ?? "未分类" }}
              </p>
            </div>

            <ToggleSwitch
              :checked="tag.enabled"
              :aria-label="`${tag.enabled ? '停用' : '启用'}${tag.name}`"
              @change="() => void handleToggle(tag)"
            />

            <NuxtLink
              :to="`/tags/${tag.id}`"
              class="flex h-8 w-8 items-center justify-center rounded-full text-[#82918B] active:bg-[#F0F3EE] transition-colors"
            >
              <BaseIcon name="pencil-simple" :size="16" />
            </NuxtLink>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
