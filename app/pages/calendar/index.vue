<script setup lang="ts">
/**
 * @page CalendarPage
 * @description 日历首页
 * @author gouxinjie
 * @created 2026-08-10
 */

import dayjs from "dayjs";
import { useCalendarStore } from "@/composables/useCalendarStore";
import { buildMonthCells, formatMonthTitle, getWeekdayLabels } from "@/utils/calendar";
import { requestApi } from "@/services/api-client";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

definePageMeta({
  layout: "main",
});

const {
  currentMonth,
  selectedDate,
  today,
  refreshKey,
  setCurrentMonth,
} = useCalendarStore();

const records = ref<ActivityLog[]>([]);
const tags = ref<ActivityTag[]>([]);
const loading = ref(true);
const pageError = ref("");
const recordError = ref("");
const feedback = ref("");
const showMonthPicker = ref(false);
const showRecordEditor = ref(false);
const savingRecord = ref(false);

/** 加载日历数据 */
async function loadCalendarData() {
  loading.value = true;
  pageError.value = "";

  try {
    const [nextTags, nextRecords] = await Promise.all([
      requestApi<ActivityTag[]>("/api/tags"),
      requestApi<ActivityLog[]>(`/api/records?month=${currentMonth.value}&_t=${Date.now()}`),
    ]);

    tags.value = nextTags;
    records.value = nextRecords;
  } catch (requestError) {
    pageError.value = requestError instanceof Error ? requestError.message : "读取月历失败";
  } finally {
    loading.value = false;
  }
}

watch(
  [currentMonth, refreshKey],
  () => {
    void loadCalendarData();
  },
  { immediate: true },
);

const cells = computed(() =>
  buildMonthCells(currentMonth.value, records.value, tags.value, selectedDate.value, today.value),
);
const monthTitle = computed(() => formatMonthTitle(currentMonth.value));
const weekdays = getWeekdayLabels();
const showInlineEmptyTip = computed(() => !loading.value && !pageError.value && records.value.length === 0);
const selectedDateRecordCount = computed(() =>
  records.value.filter((r) => r.date === selectedDate.value).length,
);
const isSelectedDateFull = computed(() => selectedDateRecordCount.value >= 3);
const lunarTodayLabel = computed(() => {
  const todayCell = cells.value.find((cell) => cell.date === today.value);
  return todayCell?.lunarLabel ?? "";
});

/** 选择月份 */
function handleMonthSelect(year: number, month: number) {
  setCurrentMonth(`${year}-${String(month).padStart(2, "0")}`);
}

/** 保存记录 */
async function handleSaveRecord(data: RecordFormData) {
  savingRecord.value = true;
  recordError.value = "";

  try {
    await requestApi<ActivityLog>("/api/records", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const nextRecords = await requestApi<ActivityLog[]>(
      `/api/records?month=${currentMonth.value}&_t=${Date.now()}`,
    );
    records.value = nextRecords;
    feedback.value = "记录已保存";
    showRecordEditor.value = false;
  } catch (requestError) {
    recordError.value = requestError instanceof Error ? requestError.message : "保存记录失败";
  } finally {
    savingRecord.value = false;
  }
}
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <header class="page-px relative z-10 shrink-0 pb-4 pt-5">
      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <button
            type="button"
            class="group inline-flex items-center gap-1.5 text-[26px] font-semibold tracking-[-0.03em] text-[#1F2A2A]"
            aria-label="选择月份"
            @click="showMonthPicker = true"
          >
            <span class="truncate">{{ monthTitle }}</span>
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F3EE] text-[#2F8E2E] transition-transform group-active:scale-[0.9]">
              <BaseIcon name="caret-down" :size="13" />
            </span>
          </button>
          <p class="mt-1.5 text-[13px] text-[#82918B]">
            {{ dayjs(today).format("M月D日 dddd") }}
            <template v-if="lunarTodayLabel"> · {{ lunarTodayLabel }}</template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/review"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5C6B66] shadow-[0_1px_2px_rgba(47,94,34,0.04),0_6px_16px_rgba(47,94,34,0.08)] transition-transform active:scale-[0.92]"
            aria-label="前往回顾"
          >
            <BaseIcon name="magnifying-glass" :size="18" />
          </NuxtLink>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5C6B66] shadow-[0_1px_2px_rgba(47,94,34,0.04),0_6px_16px_rgba(47,94,34,0.08)] transition-transform active:scale-[0.92]"
            aria-label="打开月份选择器"
            @click="showMonthPicker = true"
          >
            <BaseIcon name="calendar-blank" :size="18" />
          </button>
        </div>
      </div>
    </header>

    <div class="page-px flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-[120px]">
      <StateBanner v-if="feedback" tone="success" :message="feedback" />
      <StateBanner v-if="pageError" tone="error" :message="pageError" />

      <section
        v-if="showInlineEmptyTip"
        class="surface-card flex items-center justify-between gap-3 px-4 py-3"
      >
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-[#1F2A2A]">这个月还没有记录</p>
          <p class="mt-0.5 text-[12px] text-[#5C6B66]">点底部加号，先记下一条。</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-full bg-[#55B936] px-4 py-2 text-[12px] font-semibold text-white transition-transform active:scale-[0.96]"
          @click="showRecordEditor = true"
        >
          新增
        </button>
      </section>

      <div class="min-h-0 flex-1">
        <CalendarMonth :cells="cells" :weekdays="weekdays" />
      </div>
    </div>

    <button
      type="button"
      :disabled="isSelectedDateFull"
      :class="[
        'glass-fab absolute bottom-0 left-1/2 z-20 flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-full text-white',
        isSelectedDateFull && 'cursor-not-allowed opacity-50',
      ]"
      :aria-label="isSelectedDateFull ? '当日记录已满' : '新增记录'"
      @click="showRecordEditor = true"
    >
      <BaseIcon name="plus" :size="26" />
    </button>

    <MonthPickerSheet
      :open="showMonthPicker"
      :current-year="Number(currentMonth.split('-')[0])"
      :current-month="Number(currentMonth.split('-')[1])"
      @close="showMonthPicker = false"
      @select="handleMonthSelect"
    />

    <RecordEditor
      :open="showRecordEditor"
      :tags="tags"
      :default-date="selectedDate"
      :saving="savingRecord"
      :error-message="recordError"
      @close="
        showRecordEditor = false;
        recordError = '';
      "
      @save="handleSaveRecord"
    />
  </div>
</template>
