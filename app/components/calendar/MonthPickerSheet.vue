<script setup lang="ts">
/**
 * @component MonthPickerSheet
 * @description 月份跳转弹层
 * @author gouxinjie
 * @created 2026-08-10
 */

const props = defineProps<{
  open: boolean;
  currentYear: number;
  currentMonth: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", year: number, month: number): void;
}>();

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const year = ref(props.currentYear);

const currentDate = new Date();
const thisYear = currentDate.getFullYear();
const thisMonth = currentDate.getMonth() + 1;

const yearOptions = Array.from({ length: thisYear - 2021 + 1 }, (_, i) => 2021 + i);

/** 选择月份 */
function handleSelect(m: number) {
  emit("select", year.value, m);
  emit("close");
}

/** 回到本月 */
function handleGoToThisMonth() {
  emit("select", thisYear, thisMonth);
  emit("close");
}

/** 是否未来月份（禁用） */
function isFutureMonth(m: number): boolean {
  return year.value === thisYear && m > thisMonth;
}

/** 是否当前选中月份 */
function isCurrentMonth(m: number): boolean {
  return year.value === props.currentYear && m === props.currentMonth;
}
</script>

<template>
  <BottomSheet :open="open" title="选择月份" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-2 block text-[13px] font-medium text-[#6B7A7A]">年份</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="y in yearOptions"
            :key="y"
            type="button"
            :class="[
              'rounded-[10px] px-4 py-2 text-[14px] font-medium transition-colors',
              year === y ? 'bg-[#5EBF3F] text-white' : 'bg-[#F4F9F1] text-[#6B7A7A]',
            ]"
            @click="year = y"
          >
            {{ y }}
          </button>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-[13px] font-medium text-[#6B7A7A]">月份</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="m in MONTHS"
            :key="m"
            type="button"
            :disabled="isFutureMonth(m)"
            :class="[
              'rounded-[10px] py-3 text-[14px] font-medium transition-colors',
              isFutureMonth(m) && 'cursor-not-allowed bg-[#F4F9F1] text-[#C2CCC0]',
              !isFutureMonth(m) && isCurrentMonth(m) && 'bg-[#5EBF3F] text-white',
              !isFutureMonth(m) && !isCurrentMonth(m) && 'bg-[#F4F9F1] text-[#6B7A7A] active:bg-[#E4EDDF]',
            ]"
            @click="!isFutureMonth(m) && handleSelect(m)"
          >
            {{ m }}月
          </button>
        </div>
      </div>
    </div>
    <template #footer>
      <button
        type="button"
        class="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#5EBF3F] text-[14px] font-semibold text-white active:opacity-80"
        @click="handleGoToThisMonth"
      >
        回到本月
      </button>
    </template>
  </BottomSheet>
</template>
