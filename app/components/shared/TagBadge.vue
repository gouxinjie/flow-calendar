<script setup lang="ts">
/**
 * @component TagBadge
 * @description 记录标签徽章，颜色由传入的 hex 决定
 * @author gouxinjie
 * @created 2026-08-10
 */

withDefaults(
  defineProps<{
    label: string;
    color: string;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      compact ? 'h-5 px-2 text-[10px]' : 'h-6 px-2.5 text-[11px]',
    ]"
    :style="{ backgroundColor: `${color}1a`, color }"
  >
    {{ label }}
  </span>
</template>
