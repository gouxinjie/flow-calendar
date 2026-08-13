<script setup lang="ts">
/**
 * @component CalendarMonth
 * @description 月历网格组件
 * @author gouxinjie
 * @created 2026-08-10
 */

import type { CalendarCell } from "@/types/models";
import { getCalendarTagStyle } from "@/utils/tag-color";

defineProps<{
  cells: CalendarCell[];
  weekdays: string[];
}>();

/** 截断标签文本 */
function truncateLabel(text: string, maxLen = 2): string {
  return text.slice(0, maxLen);
}

/** 计算日期数字样式：今天套实心圆，选中品牌色，避免整格背景块 */
function dayNumberClass(cell: CalendarCell): string {
  if (cell.isToday) {
    return "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#55B936] px-1 text-white font-semibold";
  }
  if (cell.isSelected) return "text-[#2F8E2E] font-semibold";
  if (cell.isCurrentMonth) return "text-[#1F2A2A]";
  return "text-[#C0C9C4]";
}

/** 计算农历标签样式：更淡，减少视觉噪音 */
function lunarClass(cell: CalendarCell): string {
  if (cell.isToday) return "font-medium text-[#4A9E8C]";
  if (cell.isCurrentMonth) return "text-[#AAB5B0]";
  return "text-[#C0C9C4]";
}

/** 记录标签色块类：占满格子宽度的小色块，圆角更小更利落 */
function recordPillClass(): string {
  return "inline-flex h-[20px] w-full items-center justify-center whitespace-nowrap rounded-[4px] px-1.5 text-[10px] font-medium leading-none tracking-[-0.01em] text-white";
}
</script>

<template>
  <div
    class="flex flex-col rounded-[14px] border border-[#CBE0BE] bg-white px-2.5 pb-3 pt-2 shadow-[0_1px_3px_rgba(47,94,34,0.08),0_10px_28px_rgba(47,94,34,0.12)]"
  >
    <div class="mb-2 grid grid-cols-7 border-b border-[#EEF2EC] pb-2 text-center text-[11px] font-semibold">
      <span
        v-for="(day, idx) in weekdays"
        :key="day"
        :class="['py-1.5', idx === 0 || idx === 6 ? 'text-[#55B936]' : 'text-[#82918B]']"
      >
        {{ day }}
      </span>
    </div>

    <div class="grid min-h-0 grid-cols-7 gap-y-2">
      <NuxtLink
        v-for="cell in cells"
        :key="cell.date"
        :to="`/calendar/${cell.date}`"
        :class="[
          'relative flex flex-col items-center rounded-[8px] px-1 pb-2 pt-2.5 transition-all active:scale-[0.95] active:bg-[#F0F3EE]',
          !cell.isCurrentMonth && 'opacity-40',
        ]"
      >
        <span :class="['font-numeric text-[16px] leading-none', dayNumberClass(cell)]">
          {{ cell.dayNumber }}
        </span>

        <span
          v-if="cell.isSelected && !cell.isToday"
          class="mt-1 h-[3px] w-4 rounded-full bg-[#55B936]"
          aria-hidden="true"
        />

        <p v-if="cell.lunarLabel" :class="['mt-1.5 truncate text-center text-[10px] leading-none', lunarClass(cell)]">
          {{ cell.lunarLabel }}
        </p>

        <div class="mt-1.5 flex w-full flex-col items-center gap-1">
          <span
            v-for="summary in cell.recordSummaries.slice(0, 2)"
            :key="summary.id"
            :class="recordPillClass()"
            :style="getCalendarTagStyle(summary.tagColor)"
          >
            {{ truncateLabel(summary.title) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
