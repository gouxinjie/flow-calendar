<script setup lang="ts">
/**
 * @component AppCanvas
 * @description 主应用壳层，限制最大宽度，模拟手机视口
 * @author gouxinjie
 * @created 2026-08-10
 */

defineProps<{
  className?: string;
}>();
</script>

<template>
  <div class="min-h-[100dvh] sm:px-6 sm:py-6">
    <div
      :class="[
        'relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent sm:mx-auto sm:h-[calc(100dvh-48px)] sm:max-w-[430px] sm:rounded-[30px] sm:surface-card',
        className,
      ]"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,195,166,0.09),_transparent_34%)]"
      />
      <slot />
    </div>
  </div>
</template>
