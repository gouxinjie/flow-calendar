<script setup lang="ts">
/**
 * @component App
 * @description Nuxt 根组件，负责渲染布局与页面
 * @author gouxinjie
 * @created 2026-08-10
 */
useHead({
  htmlAttrs: { lang: "zh-CN" },
});
</script>

<template>
  <div class="min-h-full w-full flex flex-col overflow-x-hidden">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
