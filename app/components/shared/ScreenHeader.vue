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
  <header class="relative z-10 flex items-start justify-between gap-4 px-4 pt-4">
    <div class="flex items-start gap-3">
      <NuxtLink
        v-if="backHref"
        :to="backHref"
        class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DCEAD2] bg-white/92 text-[#1F2A2A] shadow-[0_10px_24px_rgba(31,42,42,0.06)]"
      >
        <BaseIcon name="arrow-left" :size="18" />
      </NuxtLink>
      <div>
        <h1 class="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A] text-balance">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-1 text-sm text-[#6B7A7A]">{{ subtitle }}</p>
      </div>
    </div>
    <slot name="right" />
  </header>
</template>
