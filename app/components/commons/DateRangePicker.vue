<script setup lang="ts">
/**
 * @component DateRangePicker
 * @description 移动端日期范围选择器
 * 使用原生 input[type=date]，兼容 H5 移动端，替代 antd-mobile CalendarPicker
 * @author gouxinjie
 * @created 2026-08-10
 */

import dayjs from "dayjs";

const props = defineProps<{
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
}>();

const emit = defineEmits<{
  (e: "update:startDate" | "update:endDate", date: string): void;
}>();

/** 用于按钮内展示的格式化 YYYY/MM/DD */
function display(dateStr: string, placeholder: string): string {
  if (!dateStr) return placeholder;
  return dayjs(dateStr).format("YYYY/MM/DD");
}

function handleStartChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit("update:startDate", value);
  // 若开始日期晚于结束日期，自动调整结束日期
  if (props.endDate && value && value > props.endDate) {
    emit("update:endDate", value);
  }
}

function handleEndChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit("update:endDate", value);
  // 若结束日期早于开始日期，自动调整开始日期
  if (props.startDate && value && value < props.startDate) {
    emit("update:startDate", value);
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2">
      <label
        :class="[
          'flex flex-1 cursor-pointer items-center gap-2 rounded-[12px] border border-[#E5F0DB] px-3 py-3 text-left text-[14px] transition-colors duration-200',
          startDate ? 'text-[#1F2A2A]' : 'text-[#AAB5B0]',
        ]"
      >
        <BaseIcon name="calendar-blank" :size="16" :weight="startDate ? 'fill' : 'regular'" :class="startDate ? 'text-[#55B936]' : 'text-[#AAB5B0]'" />
        <span class="flex-1 truncate">{{ display(startDate, "开始日期") }}</span>
        <input
          type="date"
          :value="startDate"
          class="sr-only"
          @change="handleStartChange"
        />
      </label>

      <span class="shrink-0 text-[14px] text-[#AAB5B0]">至</span>

      <label
        :class="[
          'flex flex-1 cursor-pointer items-center gap-2 rounded-[12px] border border-[#E5F0DB] px-3 py-3 text-left text-[14px] transition-colors duration-200',
          endDate ? 'text-[#1F2A2A]' : 'text-[#AAB5B0]',
        ]"
      >
        <BaseIcon name="calendar-blank" :size="16" :weight="endDate ? 'fill' : 'regular'" :class="endDate ? 'text-[#55B936]' : 'text-[#AAB5B0]'" />
        <span class="flex-1 truncate">{{ display(endDate, "结束日期") }}</span>
        <input
          type="date"
          :value="endDate"
          class="sr-only"
          @change="handleEndChange"
        />
      </label>
    </div>
  </div>
</template>
