<script setup lang="ts">
/**
 * @page IndexPage
 * @description 根路由入口，服务端重定向到月历页
 * @author gouxinjie
 * @created 2026-08-10
 */
await navigateTo("/calendar", { redirectCode: 302 });
</script>

<template>
  <div />
</template>
