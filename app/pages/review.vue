<script setup lang="ts">
/**
 * @page ReviewPage
 * @description 回顾页
 * @author gouxinjie
 * @created 2026-08-10
 */

import dayjs from "dayjs";
import { sortRecordsByRecent } from "@/utils/record";
import { requestApi } from "@/services/api-client";
import type {
  ActivityLog,
  ActivityTag,
  MonthReview,
  SearchFilters,
  SearchResultGroup,
} from "@/types/models";

definePageMeta({
  layout: "main",
});

type ReviewTab = "summary" | "records" | "tags";
type RecordsTimeRange = "month" | "3months" | "6months" | "year";

const viewMode = ref<ReviewTab>("summary");
const reviewMonth = ref(dayjs().format("YYYY-MM"));
const filters = ref<SearchFilters>({});
const showFilters = ref(false);
const tags = ref<ActivityTag[]>([]);
const records = ref<ActivityLog[]>([]);
const summary = ref<MonthReview | null>(null);
const loading = ref(true);
const notice = ref("");
const recordsTimeRange = ref<RecordsTimeRange>("month");
const rangeRecords = ref<ActivityLog[]>([]);
const rangeLoading = ref(false);

/** 加载回顾数据 */
async function loadReviewData() {
  loading.value = true;
  notice.value = "";

  try {
    const query = new URLSearchParams();
    if (!filters.value.startDate && !filters.value.endDate) {
      query.set("month", reviewMonth.value);
    }
    if (filters.value.keyword) query.set("keyword", filters.value.keyword);
    if (filters.value.tagId) query.set("tagId", filters.value.tagId);
    if (filters.value.startDate) query.set("startDate", filters.value.startDate);
    if (filters.value.endDate) query.set("endDate", filters.value.endDate);
    if (filters.value.includeUncategorized === false) query.set("includeUncategorized", "false");
    query.set("sort", "desc");

    const [nextTags, nextSummary, nextRecords] = await Promise.all([
      requestApi<ActivityTag[]>("/api/tags"),
      requestApi<MonthReview>(`/api/review?month=${reviewMonth.value}`),
      requestApi<ActivityLog[]>(`/api/records?${query.toString()}`),
    ]);

    tags.value = nextTags;
    summary.value = nextSummary;
    records.value = sortRecordsByRecent(nextRecords);
  } catch (requestError) {
    notice.value = requestError instanceof Error ? requestError.message : "读取回顾数据失败";
  } finally {
    loading.value = false;
  }
}

watch(
  [filters, reviewMonth],
  () => {
    void loadReviewData();
  },
  { immediate: true, deep: true },
);

/** 加载时间范围记录 */
async function loadRangeRecords() {
  if (recordsTimeRange.value === "month") return;
  rangeLoading.value = true;
  try {
    const today = dayjs();
    const endDate = today.format("YYYY-MM-DD");
    let startDate = "";

    if (recordsTimeRange.value === "3months") {
      startDate = today.subtract(3, "month").startOf("month").format("YYYY-MM-DD");
    } else if (recordsTimeRange.value === "6months") {
      startDate = today.subtract(6, "month").startOf("month").format("YYYY-MM-DD");
    } else if (recordsTimeRange.value === "year") {
      startDate = today.startOf("year").format("YYYY-MM-DD");
    }

    const query = new URLSearchParams();
    query.set("startDate", startDate);
    query.set("endDate", endDate);
    query.set("sort", "desc");

    const data = await requestApi<ActivityLog[]>(`/api/records?${query.toString()}`);
    rangeRecords.value = sortRecordsByRecent(data);
  } catch {
    // 静默失败
  } finally {
    rangeLoading.value = false;
  }
}

watch(recordsTimeRange, () => {
  void loadRangeRecords();
});

/** 按日期分组 */
function groupRecords(list: ActivityLog[]): SearchResultGroup[] {
  const groupMap = new Map<string, ActivityLog[]>();
  for (const record of list) {
    const currentRecords = groupMap.get(record.date) ?? [];
    currentRecords.push(record);
    groupMap.set(record.date, currentRecords);
  }
  return Array.from(groupMap.entries()).map(([date, groupedRecords]) => ({
    date,
    records: groupedRecords,
  }));
}

const groupedResults = computed(() => groupRecords(records.value));
const groupedRangeResults = computed(() => groupRecords(rangeRecords.value));

const hasFilters = computed(() =>
  Boolean(filters.value.keyword || filters.value.tagId || filters.value.startDate || filters.value.endDate),
);
const currentMonth = dayjs().format("YYYY-MM");

/** 切换月份 */
function moveMonth(direction: "prev" | "next") {
  const nextMonth = dayjs(`${reviewMonth.value}-01`)[direction === "prev" ? "subtract" : "add"](1, "month");
  if (nextMonth.format("YYYY-MM") > currentMonth) return;
  reviewMonth.value = nextMonth.format("YYYY-MM");
}

/** 获取标签 */
function getTagLabel(tagId?: string | null) {
  return tags.value.find((tag) => tag.id === tagId);
}

/** 标签统计 */
const tagStats = computed(() => {
  const enabledTags = tags.value.filter((t) => t.enabled);
  const countMap = new Map<string, number>();
  for (const record of records.value) {
    if (record.tagId) {
      countMap.set(record.tagId, (countMap.get(record.tagId) ?? 0) + 1);
    }
  }
  return enabledTags
    .map((tag) => ({ tag, count: countMap.get(tag.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
});

/** 格式化环比文案 */
function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "0";
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex items-center justify-between px-5 pb-3 pt-5">
      <div>
        <h1 class="text-[26px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">回顾</h1>
        <p class="mt-1 text-[13px] text-[#82918B]">回顾过去，遇见成长</p>
      </div>
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5C6B66] shadow-[0_1px_2px_rgba(47,94,34,0.04),0_6px_16px_rgba(47,94,34,0.08)] transition-transform active:scale-[0.94]"
        aria-label="搜索与筛选"
        @click="showFilters = true"
      >
        <BaseIcon name="faders-horizontal" :size="20" />
      </button>
    </header>

    <div class="flex-1 overflow-y-auto px-5 pb-5 [scrollbar-gutter:stable]">
      <StateBanner v-if="notice" tone="error" :message="notice" class="mb-4" />

      <!-- 顶部三栏 Tabs -->
      <div class="mt-3 mb-2 flex items-center gap-6 border-b border-[#EEF2EC]">
        <button
          v-for="tab in [
            { key: 'summary' as ReviewTab, label: '月度回顾' },
            { key: 'records' as ReviewTab, label: '全部记录' },
            { key: 'tags' as ReviewTab, label: '标签统计' },
          ]"
          :key="tab.key"
          type="button"
          :class="[
            'relative pb-3 text-[15px] transition-colors',
            viewMode === tab.key ? 'text-[#1F2A2A]' : 'text-[#AAB5B0]',
          ]"
          @click="viewMode = tab.key"
        >
          {{ tab.label }}
          <span
            v-if="viewMode === tab.key"
            class="absolute -bottom-px left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-[#55B936]"
          />
        </button>
      </div>

      <!-- 月份选择器 -->
      <div
        v-if="viewMode === 'summary' || viewMode === 'tags'"
        class="mb-4 flex items-center justify-between rounded-[14px] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(47,94,34,0.04),0_6px_16px_rgba(47,94,34,0.06)]"
      >
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-[#5C6B66] transition-colors active:bg-[#F0F3EE]"
          aria-label="上一月"
          @click="moveMonth('prev')"
        >
          <BaseIcon name="caret-left" :size="18" />
        </button>
        <p class="flex items-center gap-1.5 text-[15px] font-semibold text-[#1F2A2A]">
          <BaseIcon name="calendar-blank" :size="16" class="text-[#2F8E2E]" />
          {{ dayjs(`${reviewMonth}-01`).format("YYYY年M月") }}
        </p>
        <button
          type="button"
          :disabled="reviewMonth === currentMonth"
          class="flex h-9 w-9 items-center justify-center rounded-full text-[#5C6B66] transition-colors active:bg-[#F0F3EE] disabled:opacity-30"
          aria-label="下一月"
          @click="moveMonth('next')"
        >
          <BaseIcon name="caret-right" :size="18" />
        </button>
      </div>

      <!-- 全部记录时间范围切换 -->
      <div v-if="viewMode === 'records'" class="mb-4 flex items-center rounded-full bg-[#F0F3EE] p-1">
        <button
          v-for="range in [
            { key: 'month' as RecordsTimeRange, label: '按月' },
            { key: '3months' as RecordsTimeRange, label: '3个月' },
            { key: '6months' as RecordsTimeRange, label: '6个月' },
            { key: 'year' as RecordsTimeRange, label: '本年' },
          ]"
          :key="range.key"
          type="button"
          :class="[
            'flex-1 rounded-full px-2 py-2 text-[13px] font-medium transition-all duration-200',
            recordsTimeRange === range.key
              ? 'bg-white text-[#2F8E2E] shadow-[0_2px_8px_rgba(47,94,34,0.08)]'
              : 'text-[#5C6B66]',
          ]"
          @click="recordsTimeRange = range.key"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- 当前筛选 -->
      <div
        v-if="hasFilters"
        class="mb-4 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#F0F3EE] px-3 py-3"
      >
        <span class="text-[12px] font-medium text-[#2F8E2E]">当前筛选</span>
        <span v-if="filters.keyword" class="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
          {{ filters.keyword }}
        </span>
        <span v-if="filters.tagId" class="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
          {{ getTagLabel(filters.tagId)?.name ?? "标签" }}
        </span>
        <span v-if="filters.startDate" class="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
          {{ filters.startDate }} 起
        </span>
        <span v-if="filters.endDate" class="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
          至 {{ filters.endDate }}
        </span>
        <button
          type="button"
          class="ml-auto text-[12px] font-semibold text-[#2F8E2E]"
          @click="filters = {}"
        >
          清除
        </button>
      </div>

      <SectionCard v-if="loading" class="h-[240px] animate-pulse bg-white/70" />

      <!-- 月度回顾 -->
      <div v-else-if="viewMode === 'summary' && summary" class="flex flex-col gap-4">
        <!-- 统计卡片：大数字 + 柔和色点，呼吸感排版 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="surface-card relative overflow-hidden p-5">
            <span class="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#EAF6E4]" aria-hidden="true" />
            <p class="text-[13px] text-[#5C6B66]">记录总数</p>
            <p class="mt-3 flex items-baseline gap-1.5">
              <span class="font-numeric text-[34px] font-semibold leading-none tracking-[-0.02em] text-[#1F2A2A]">
                {{ summary.totalRecords }}
              </span>
              <span class="text-[13px] text-[#82918B]">条</span>
            </p>
            <p class="mt-3 flex items-center gap-1 text-[12px] text-[#82918B]">
              <span class="inline-block h-1.5 w-1.5 rounded-full" :class="summary.totalRecordsDelta >= 0 ? 'bg-[#55B936]' : 'bg-[#D85A5A]'" />
              较上月
              <span
                :class="[
                  'font-medium',
                  summary.totalRecordsDelta > 0 ? 'text-[#2F8E2E]' : summary.totalRecordsDelta < 0 ? 'text-[#D85A5A]' : 'text-[#82918B]',
                ]"
              >
                {{ formatDelta(summary.totalRecordsDelta) }}
              </span>
            </p>
          </div>
          <div class="surface-card relative overflow-hidden p-5">
            <span class="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#E6F1FA]" aria-hidden="true" />
            <p class="text-[13px] text-[#5C6B66]">记录天数</p>
            <p class="mt-3 flex items-baseline gap-1.5">
              <span class="font-numeric text-[34px] font-semibold leading-none tracking-[-0.02em] text-[#1F2A2A]">
                {{ summary.recordDays }}
              </span>
              <span class="text-[13px] text-[#82918B]">天</span>
            </p>
            <p class="mt-3 flex items-center gap-1 text-[12px] text-[#82918B]">
              <span class="inline-block h-1.5 w-1.5 rounded-full" :class="summary.recordDaysDelta >= 0 ? 'bg-[#55B936]' : 'bg-[#D85A5A]'" />
              较上月
              <span
                :class="[
                  'font-medium',
                  summary.recordDaysDelta > 0 ? 'text-[#2F8E2E]' : summary.recordDaysDelta < 0 ? 'text-[#D85A5A]' : 'text-[#82918B]',
                ]"
              >
                {{ formatDelta(summary.recordDaysDelta) }}
              </span>
            </p>
          </div>
        </div>

        <!-- 高频标签 Top 5 -->
        <SectionCard>
          <h3 class="mb-4 text-[15px] font-semibold text-[#1F2A2A]">
            高频标签 <span class="ml-1 rounded-full bg-[#F0F3EE] px-2 py-0.5 font-numeric text-[11px] font-medium text-[#5C6B66]">Top {{ summary.topTags.length || 5 }}</span>
          </h3>
          <p v-if="summary.topTags.length === 0" class="text-[13px] text-[#82918B]">
            本月还没有带标签的记录。
          </p>
          <div v-else class="flex flex-col gap-4">
            <div
              v-for="tag in summary.topTags"
              :key="tag.tagId"
              class="flex items-center gap-3"
            >
              <span class="w-14 shrink-0 truncate text-[13px] font-medium text-[#1F2A2A]">
                {{ tag.tagName }}
              </span>
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF2EC]">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out"
                  :style="{
                    width: `${Math.max((tag.count / Math.max(summary.topTags[0]?.count ?? 1, 1)) * 100, 12)}%`,
                    backgroundColor: tag.tagColor,
                  }"
                />
              </div>
              <span class="w-8 shrink-0 text-right font-numeric text-[13px] font-semibold text-[#1F2A2A]">
                {{ tag.count }}
              </span>
            </div>
          </div>
        </SectionCard>

        <!-- 最近记录 -->
        <SectionCard>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-[15px] font-semibold text-[#1F2A2A]">最近记录</h3>
            <button
              type="button"
              class="flex items-center gap-1 text-[12px] font-medium text-[#2F8E2E] transition-opacity active:opacity-60"
              @click="viewMode = 'records'"
            >
              查看更多
              <BaseIcon name="arrow-right" :size="12" />
            </button>
          </div>
          <p v-if="summary.recentRecords.length === 0" class="py-6 text-center text-[13px] text-[#82918B]">
            这个月暂时还没有内容。
          </p>
          <div v-else class="flex flex-col">
            <div
              v-for="(record, index) in summary.recentRecords.slice(0, 5)"
              :key="record.id"
              class="flex items-center gap-3 rounded-[12px] py-3"
              :class="index > 0 && 'border-t border-[#EEF2EC]'"
            >
              <div class="w-[64px] shrink-0 text-right text-[13px] font-semibold text-[#1F2A2A]">
                {{ dayjs(record.date).format("D日") }}
              </div>
              <div class="h-6 w-px shrink-0 bg-[#EEF2EC]" aria-hidden="true" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[14px] font-medium text-[#1F2A2A]">{{ record.title }}</p>
                <p v-if="record.startTime" class="mt-0.5 font-numeric text-[11px] text-[#82918B]">{{ record.startTime }}</p>
              </div>
              <TagBadge v-if="record.tag" :label="record.tag.name" :color="record.tag.color" compact />
            </div>
          </div>
        </SectionCard>
      </div>

      <!-- 标签统计 -->
      <div v-else-if="viewMode === 'tags'">
        <EmptyState
          v-if="tagStats.length === 0"
          icon-name="calendar-blank"
          title="还没有可用标签"
          description="前往「标签」页面创建并启用标签后，会在这里汇总使用情况。"
        />
        <SectionCard v-else>
          <div class="flex flex-col divide-y divide-[#EEF2EC]">
            <div v-for="item in tagStats" :key="item.tag.id" class="flex items-center gap-2 py-3">
              <div class="min-w-0 flex-1">
                <p class="truncate text-[14px] font-medium text-[#1F2A2A]">{{ item.tag.name }}</p>
                <p class="mt-0.5 text-[12px] text-[#82918B]">
                  本月 {{ item.count }} 次 · 累计 {{ item.count }} 次
                </p>
              </div>
              <span class="font-numeric text-[18px] font-semibold text-[#1F2A2A]">
                {{ item.count }}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      <!-- 时间范围预设记录 -->
      <div v-else-if="recordsTimeRange !== 'month'">
        <div v-if="rangeLoading" class="flex flex-col gap-4">
          <SectionCard v-for="i in 4" :key="i" class="h-[120px] animate-pulse bg-white/60" />
        </div>
        <EmptyState
          v-else-if="groupedRangeResults.length === 0"
          icon-name="calendar-blank"
          title="没有找到符合条件的记录"
          description="当前时间范围内还没有记录。"
        />
        <div v-else class="flex flex-col gap-4">
          <SectionCard v-for="group in groupedRangeResults" :key="group.date">
            <h3 class="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#1F2A2A]">
              <BaseIcon name="calendar-blank" :size="16" class="text-[#55B936]" />
              {{ dayjs(group.date).format("M月D日 dddd") }}
            </h3>
            <div class="flex flex-col">
              <div
                v-for="(record, index) in group.records"
                :key="record.id"
                class="flex items-center gap-3 rounded-[12px] py-2.5"
                :class="index > 0 && 'border-t border-[#EEF2EC]'"
              >
                <span
                  class="h-1.5 w-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: record.tag?.color ?? '#C3CCC7' }"
                  aria-hidden="true"
                />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[14px] font-medium text-[#1F2A2A]">{{ record.title }}</p>
                  <p v-if="record.startTime || record.note" class="mt-0.5 truncate text-[12px] text-[#82918B]">
                    {{ record.startTime ?? "" }}<template v-if="record.startTime && record.note"> · </template>{{ record.note }}
                  </p>
                </div>
                <TagBadge v-if="record.tag" :label="record.tag.name" :color="record.tag.color" compact />
                <span v-else class="text-[11px] text-[#AAB5B0]">未分类</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <!-- 默认全部记录（按月） -->
      <div v-else-if="groupedResults.length === 0">
        <EmptyState
          icon-name="calendar-blank"
          title="没有找到符合条件的记录"
          description="可以放宽关键词、日期范围或标签条件再试一次。"
        />
      </div>
      <div v-else class="flex flex-col gap-4">
        <SectionCard v-for="group in groupedResults" :key="group.date">
          <h3 class="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#1F2A2A]">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF6E4] text-[#2F8E2E]">
              <BaseIcon name="calendar-blank" :size="14" />
            </span>
            {{ dayjs(group.date).format("M月D日 dddd") }}
          </h3>
          <div class="flex flex-col">
            <div
              v-for="(record, index) in group.records"
              :key="record.id"
              class="flex items-center gap-3 rounded-[12px] py-2.5"
              :class="index > 0 && 'border-t border-[#EEF2EC]'"
            >
              <span
                class="h-1.5 w-1.5 shrink-0 rounded-full"
                :style="{ backgroundColor: record.tag?.color ?? '#C3CCC7' }"
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[14px] font-medium text-[#1F2A2A]">{{ record.title }}</p>
                <p v-if="record.startTime || record.note" class="mt-0.5 truncate text-[12px] text-[#82918B]">
                  {{ record.startTime ?? "" }}<template v-if="record.startTime && record.note"> · </template>{{ record.note }}
                </p>
              </div>
              <TagBadge v-if="record.tag" :label="record.tag.name" :color="record.tag.color" compact />
              <span v-else class="text-[11px] text-[#AAB5B0]">未分类</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>

    <SearchFilterSheet
      :key="`search-filter-${showFilters ? JSON.stringify(filters) : 'closed'}`"
      :open="showFilters"
      :tags="tags"
      :initial-filters="filters"
      @close="showFilters = false"
      @apply="(next) => {
        filters = next;
        viewMode = 'records';
      }"
    />
  </div>
</template>
