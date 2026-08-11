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
    <noscript>
      <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFFFFF] px-6">
        <p class="text-[#1F2A2A] text-[16px] font-medium">请启用 JavaScript</p>
        <p class="mt-2 text-[#82918B] text-[14px]">青柠日历 需要 JavaScript 才能运行</p>
      </div>
    </noscript>
  </div>
</template>
