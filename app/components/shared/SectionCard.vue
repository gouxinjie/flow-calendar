<script setup lang="ts">
/**
 * @component SectionCard
 * @description 通用卡片容器
 * @author gouxinjie
 * @created 2026-08-10
 */

defineProps<{
  className?: string;
}>();
</script>

<template>
  <section :class="['surface-card !rounded-[16px] p-4', className]">
    <slot />
  </section>
</template>
