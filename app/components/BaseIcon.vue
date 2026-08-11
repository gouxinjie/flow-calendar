<script setup lang="ts">
/**
 * @component BaseIcon
 * @description 通用图标组件，基于官方 @phosphor-icons/vue
 * 通过 kebab-case 图标名映射到官方 Phosphor 组件，替换早期手写的 SVG 路径
 * 支持 size / weight（regular、bold、fill），并透传 class 用于控制颜色
 * @author gouxinjie
 * @created 2026-08-10
 * @updated 2026-08-11
 */

import {
  PhArrowLeft,
  PhArrowRight,
  PhArrowsClockwise,
  PhCalendarBlank,
  PhCaretDown,
  PhCaretLeft,
  PhCaretRight,
  PhCaretUp,
  PhChartBar,
  PhClock,
  PhCopy,
  PhDeviceMobile,
  PhDotsSixVertical,
  PhDotsThree,
  PhEnvelope,
  PhEye,
  PhEyeSlash,
  PhFadersHorizontal,
  PhInfo,
  PhLock,
  PhMagnifyingGlass,
  PhPencilSimple,
  PhPhone,
  PhPlus,
  PhSignOut,
  PhTagSimple,
  PhTrash,
  PhUser,
  PhX,
} from "@phosphor-icons/vue";
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    /** 图标名称（kebab-case，对应 Phosphor 组件名） */
    name: string;
    /** 尺寸 px */
    size?: number;
    /** 图标粗细：regular / bold / fill */
    weight?: "regular" | "bold" | "fill";
  }>(),
  {
    size: 20,
    weight: "regular",
  },
);

/** kebab-case 图标名 → Phosphor 组件映射 */
const ICONS: Record<string, Component> = {
  "arrow-left": PhArrowLeft,
  "arrow-right": PhArrowRight,
  "arrows-clockwise": PhArrowsClockwise,
  "calendar-blank": PhCalendarBlank,
  "caret-down": PhCaretDown,
  "caret-left": PhCaretLeft,
  "caret-right": PhCaretRight,
  "caret-up": PhCaretUp,
  "chart-bar": PhChartBar,
  clock: PhClock,
  copy: PhCopy,
  "device-mobile": PhDeviceMobile,
  "dots-six-vertical": PhDotsSixVertical,
  "dots-three": PhDotsThree,
  envelope: PhEnvelope,
  eye: PhEye,
  "eye-slash": PhEyeSlash,
  "faders-horizontal": PhFadersHorizontal,
  info: PhInfo,
  lock: PhLock,
  "magnifying-glass": PhMagnifyingGlass,
  "pencil-simple": PhPencilSimple,
  phone: PhPhone,
  plus: PhPlus,
  "sign-out": PhSignOut,
  "tag-simple": PhTagSimple,
  trash: PhTrash,
  user: PhUser,
  x: PhX,
};

/** 当前使用的图标组件；未匹配时回退到 info */
const iconComponent = computed(() => {
  const matched = ICONS[props.name];
  if (!matched && import.meta.dev) {
    console.warn(`[BaseIcon] 未匹配的图标名: "${props.name}"`);
  }
  return matched ?? PhInfo;
});
</script>

<template>
  <component
    :is="iconComponent"
    :size="size"
    :weight="weight"
    aria-hidden="true"
    class="inline-block shrink-0"
  />
</template>
