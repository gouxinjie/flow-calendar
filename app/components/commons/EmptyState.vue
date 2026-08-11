<script setup lang="ts">
/**
 * @component EmptyState
 * @description 通用空状态组件
 * @author gouxinjie
 * @created 2026-08-10
 */

defineProps<{
  iconName?: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#DCEAD2] bg-white/70 px-6 py-12 text-center"
  >
    <div
      v-if="iconName"
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5E9] text-[#8BA09B]"
    >
      <BaseIcon :name="iconName" :size="26" />
    </div>
    <h3 class="text-[16px] font-semibold text-[#243332]">{{ title }}</h3>
    <p class="mt-2 max-w-[18rem] text-[13px] leading-6 text-[#70807D]">{{ description }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>
