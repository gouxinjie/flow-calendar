<script setup lang="ts">
/**
 * @component BottomNav
 * @description 移动端底部主导航，3 个入口：月历、回顾、我的
 * @author gouxinjie
 * @created 2026-08-10
 */

const route = useRoute();

const NAV_ITEMS = [
  { href: "/calendar", label: "月历", icon: "calendar-blank" },
  { href: "/review", label: "回顾", icon: "chart-bar" },
  { href: "/me", label: "我的", icon: "user" },
] as const;

/** 判断当前导航项是否激活 */
function isActive(href: string): boolean {
  return route.path === href || route.path.startsWith(`${href}/`);
}
</script>

<template>
  <nav
    class="safe-pb z-20 mt-auto shrink-0 border-t border-[#ECF1EF] bg-white px-4 pt-2 backdrop-blur"
  >
    <div class="grid grid-cols-3 gap-1">
      <NuxtLink
        v-for="item in NAV_ITEMS"
        :key="item.href"
        :to="item.href"
        :class="[
          'flex min-h-[62px] flex-col items-center justify-center gap-1 px-2 py-2 text-[12px] transition-colors active:scale-[0.98]',
          isActive(item.href) ? '!text-[#3D9428]' : '!text-[#A3AEAB]',
        ]"
        :aria-current="isActive(item.href) ? 'page' : undefined"
      >
        <BaseIcon
          :name="item.icon"
          :size="21"
          :weight="isActive(item.href) ? 'fill' : 'regular'"
        />
        <span :class="['leading-none', isActive(item.href) && 'font-semibold']">
          {{ item.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
