<script setup lang="ts">
/**
 * @component ConfirmSheet
 * @description 通用删除确认抽屉
 * @author gouxinjie
 * @created 2026-08-10
 */

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
  }>(),
  {
    confirmText: "确认删除",
    cancelText: "取消",
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "confirm" | "close"): void;
}>();
</script>

<template>
  <BottomSheet :open="open" :title="title" @close="emit('close')">
    <p class="text-[14px] leading-7 text-[#60716E]">{{ description }}</p>
    <template #footer>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#DCEAD2] text-[14px] font-medium text-[#60716E]"
          @click="emit('close')"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="flex h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#D85A5A] text-[14px] font-semibold text-white disabled:opacity-60"
          :disabled="loading"
          @click="emit('confirm')"
        >
          {{ loading ? "处理中…" : confirmText }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
