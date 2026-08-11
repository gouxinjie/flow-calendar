<script setup lang="ts">
/**
 * @component MainLayout
 * @description 主应用布局，包含底部导航与鉴权守卫
 * 通过页面 definePageMeta({ layout: "main" }) 启用
 * @author gouxinjie
 * @created 2026-08-10
 */
</script>

<template>
  <AuthGuard>
    <AppCanvas class="bg-[#FFFFFF]">
      <main class="min-h-0 flex-1 overflow-y-scroll overscroll-y-contain">
        <NuxtPage />
      </main>
      <BottomNav />
    </AppCanvas>
  </AuthGuard>
</template>
