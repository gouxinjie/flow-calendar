<script setup lang="ts">
/**
 * @component ScreenHeader
 * @description 二级页面通用头部
 * @author gouxinjie
 * @created 2026-08-10
 */

defineProps<{
  title: string;
  subtitle?: string;
  backHref?: string;
}>();
</script>

<template>
  <header class="page-px relative z-10 flex items-center justify-between gap-4 pb-2 pt-4">
    <div class="flex items-center gap-2">
      <NuxtLink
        v-if="backHref"
        :to="backHref"
        class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#5C6B66] transition-colors active:bg-[#EEF2EC]"
      >
        <BaseIcon name="arrow-left" :size="20" />
      </NuxtLink>
      <div>
        <h1 class="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A] text-balance">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-0.5 text-[12px] text-[#82918B]">{{ subtitle }}</p>
      </div>
    </div>
    <slot name="right" />
  </header>
</template>
