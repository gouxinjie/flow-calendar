<script setup lang="ts">
/**
 * @component SearchFilterSheet
 * @description 搜索与筛选弹层
 * @author gouxinjie
 * @created 2026-08-10
 */

import type { ActivityTag, SearchFilters } from "@/types/models";
import { getNeutralButtonStyle, getTagButtonStyle } from "@/utils/tag-color";

const props = defineProps<{
  open: boolean;
  tags: ActivityTag[];
  initialFilters: SearchFilters;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "apply", filters: SearchFilters): void;
}>();

const keyword = ref(props.initialFilters.keyword ?? "");
const tagId = ref<string | undefined>(props.initialFilters.tagId);
const startDate = ref(props.initialFilters.startDate ?? "");
const endDate = ref(props.initialFilters.endDate ?? "");
const includeUncategorized = ref(props.initialFilters.includeUncategorized ?? true);

// 每次打开弹层时重置为最新筛选条件（替代父组件动态 key 重挂载，避免 BottomSheet 重挂载动画异常）
watch(
  () => props.open,
  (val) => {
    if (val) {
      keyword.value = props.initialFilters.keyword ?? "";
      tagId.value = props.initialFilters.tagId;
      startDate.value = props.initialFilters.startDate ?? "";
      endDate.value = props.initialFilters.endDate ?? "";
      includeUncategorized.value = props.initialFilters.includeUncategorized ?? true;
    }
  },
);

/** 应用筛选 */
function handleApply() {
  emit("apply", {
    keyword: keyword.value.trim() || undefined,
    tagId: tagId.value,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    includeUncategorized: includeUncategorized.value,
  });
  emit("close");
}

/** 重置 */
function handleReset() {
  keyword.value = "";
  tagId.value = undefined;
  startDate.value = "";
  endDate.value = "";
  includeUncategorized.value = true;
}
</script>

<template>
  <BottomSheet :open="open" title="搜索与筛选" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#5C6B66]">关键词</label>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索标题或备注…"
          class="w-full rounded-[12px] border border-[#E5F0DB] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#AAB5B0] outline-none transition-colors focus:border-[#55B936]/70 focus:ring-2 focus:ring-[#55B936]/10"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#5C6B66]">标签筛选</label>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
            :style="getNeutralButtonStyle(!tagId)"
            @click="tagId = undefined"
          >
            全部
          </button>
          <button
            v-for="tag in tags.filter((t) => t.enabled)"
            :key="tag.id"
            type="button"
            class="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
            :style="getTagButtonStyle(tag.color, tagId === tag.id)"
            @click="tagId = tag.id"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#5C6B66]">日期范围</label>
        <DateRangePicker
          :start-date="startDate"
          :end-date="endDate"
          @update:start-date="(v: string) => (startDate = v)"
          @update:end-date="(v: string) => (endDate = v)"
        />
      </div>

      <label class="flex cursor-pointer items-center gap-3 active:opacity-80">
        <div class="relative h-5 w-5 shrink-0">
          <input v-model="includeUncategorized" type="checkbox" class="peer sr-only" />
          <span class="absolute inset-0 rounded-[6px] border border-[#E5F0DB] bg-white transition-all duration-200 peer-checked:border-[#55B936] peer-checked:bg-[#55B936]" />
          <svg
            class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 text-white transition-transform duration-200 peer-checked:scale-100"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M2 6L5 9L10 3" />
          </svg>
        </div>
        <span class="text-[14px] text-[#1F2A2A]">包含未分类记录</span>
      </label>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex h-[50px] flex-1 items-center justify-center rounded-full border border-[#E5F0DB] text-[14px] font-medium text-[#5C6B66] transition-colors active:bg-[#F6FBF3]"
          @click="handleReset"
        >
          重置
        </button>
        <button
          type="button"
          class="flex h-[50px] flex-1 items-center justify-center rounded-full bg-[#55B936] text-[14px] font-semibold text-white transition-all active:scale-[0.98]"
          @click="handleApply"
        >
          应用筛选
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
