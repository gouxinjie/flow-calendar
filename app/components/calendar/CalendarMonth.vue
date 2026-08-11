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
function truncateLabel(text: string, maxLen = 3): string {
  return text.slice(0, maxLen);
}

/** 计算单元格表面样式类 */
function cellSurfaceClass(cell: CalendarCell): string {
  if (cell.isToday) {
    return cell.isSelected
      ? "border-2 border-[#3D9428] bg-[#F3FCF6] shadow-[inset_0_0_0_1px_rgba(61,148,40,0.16)]"
      : "border-2 border-[#74CC50] bg-white";
  }
  if (cell.isSelected) {
    return "border-[#74CC50] bg-[#F3FCF6] shadow-[inset_0_0_0_1px_rgba(116,204,80,0.08)]";
  }
  return "bg-white";
}

/** 计算日期数字样式 */
function dayNumberClass(cell: CalendarCell): string {
  if (cell.isToday) {
    return "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#5EBF3F] px-1 text-white";
  }
  if (!cell.isToday && cell.isSelected) return "text-[#3D9428]";
  if (!cell.isToday && cell.isCurrentMonth) return "text-[#1F2A2A]";
  return "text-[#afaeb1]";
}

/** 计算农历标签样式 */
function lunarClass(cell: CalendarCell): string {
  if (cell.isToday) return "font-medium text-[#54C1AC]";
  if (cell.isCurrentMonth) return "text-[#9BAE97]";
  return "text-[#afaeb1]";
}
</script>

<template>
  <div
    class="flex flex-col rounded-[8px] border border-[#DCEAD2] bg-white px-3 pb-3 pt-2 shadow-[0_14px_30px_rgba(18,46,40,0.04)]"
  >
    <div class="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold">
      <span
        v-for="(day, idx) in weekdays"
        :key="day"
        :class="['py-1.5', idx === 0 || idx === 6 ? 'text-[#5EBF3F]' : 'text-[#1F2A2A]']"
      >
        {{ day }}
      </span>
    </div>

    <div class="grid min-h-0 grid-cols-7 gap-y-3">
      <NuxtLink
        v-for="cell in cells"
        :key="cell.date"
        :to="`/calendar/${cell.date}`"
        :class="[
          'relative flex min-h-0 flex-col rounded-[8px] border border-transparent px-1.5 pb-1.5 pt-2 transition-transform active:scale-[0.98]',
          cellSurfaceClass(cell),
          !cell.isCurrentMonth && 'opacity-50',
        ]"
      >
        <div class="flex justify-center">
          <span :class="['font-numeric text-[15px] font-semibold leading-none', dayNumberClass(cell)]">
            {{ cell.dayNumber }}
          </span>
        </div>

        <p v-if="cell.lunarLabel" :class="['mt-1 self-center truncate text-center text-[10px] leading-none', lunarClass(cell)]">
          {{ cell.lunarLabel }}
        </p>

        <div class="mt-[6px] flex min-h-0 flex-col items-center gap-1">
          <span
            v-for="summary in cell.recordSummaries.slice(0, 2)"
            :key="summary.id"
            :class="[
              'inline-flex h-6 w-[4em] items-center justify-center self-center whitespace-nowrap rounded-[4px] px-1.5 text-[11px] font-normal leading-none tracking-[-0.02em] text-white',
              !cell.isCurrentMonth && 'opacity-70',
            ]"
            :style="getCalendarTagStyle(summary.tagColor)"
          >
            {{ truncateLabel(summary.title) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
