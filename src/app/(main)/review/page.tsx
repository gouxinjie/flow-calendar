"use client";

/**
 * @page ReviewPage
 * @description 回顾页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-30
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  FadersHorizontal,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import dayjs from "dayjs";

import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { SearchFilterSheet } from "@/components/business/review/search-filter-sheet";
import { SectionCard, TagBadge } from "@/components/business/shared/mobile-shell";
import { sortRecordsByRecent } from "@/lib/record";
import { requestApi } from "@/services/api-client";
import type {
  ActivityLog,
  ActivityTag,
  MonthReview,
  SearchFilters,
  SearchResultGroup,
} from "@/types/models";

/** 顶部 tab 类型 */
type ReviewTab = "summary" | "records" | "tags";

export default function ReviewPage() {
  const [viewMode, setViewMode] = useState<ReviewTab>("summary");
  const [reviewMonth, setReviewMonth] = useState(dayjs().format("YYYY-MM"));
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [records, setRecords] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<MonthReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  /** 全部记录时间范围：按月 / 最近3个月 / 最近6个月 / 本年 */
  type RecordsTimeRange = "month" | "3months" | "6months" | "year";
  const [recordsTimeRange, setRecordsTimeRange] = useState<RecordsTimeRange>("month");
  /** 按时间范围拉取的全部记录 */
  const [rangeRecords, setRangeRecords] = useState<ActivityLog[]>([]);
  const [rangeLoading, setRangeLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReviewData() {
      setLoading(true);
      setNotice("");

      try {
        const query = new URLSearchParams();
        query.set("month", reviewMonth);
        if (filters.keyword) query.set("keyword", filters.keyword);
        if (filters.tagId) query.set("tagId", filters.tagId);
        if (filters.startDate) query.set("startDate", filters.startDate);
        if (filters.endDate) query.set("endDate", filters.endDate);
        if (filters.includeUncategorized === false) query.set("includeUncategorized", "false");
        query.set("sort", "desc");

        const [nextTags, nextSummary, nextRecords] = await Promise.all([
          requestApi<ActivityTag[]>("/api/tags"),
          requestApi<MonthReview>(`/api/review?month=${reviewMonth}`),
          requestApi<ActivityLog[]>(`/api/records?${query.toString()}`),
        ]);

        if (!active) {
          return;
        }

        setTags(nextTags);
        setSummary(nextSummary);
        setRecords(sortRecordsByRecent(nextRecords));
      } catch (requestError) {
        if (!active) {
          return;
        }

        setNotice(requestError instanceof Error ? requestError.message : "读取回顾数据失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReviewData();

    return () => {
      active = false;
    };
  }, [filters, reviewMonth]);

  // 全部记录时间范围切换时，拉取对应日期范围的记录
  useEffect(() => {
    if (recordsTimeRange === "month") return;
    let active = true;

    async function loadRangeRecords() {
      setRangeLoading(true);
      try {
        const today = dayjs();
        const endDate = today.format("YYYY-MM-DD");
        let startDate = "";

        if (recordsTimeRange === "3months") {
          startDate = today.subtract(3, "month").startOf("month").format("YYYY-MM-DD");
        } else if (recordsTimeRange === "6months") {
          startDate = today.subtract(6, "month").startOf("month").format("YYYY-MM-DD");
        } else if (recordsTimeRange === "year") {
          startDate = today.startOf("year").format("YYYY-MM-DD");
        }

        const query = new URLSearchParams();
        query.set("startDate", startDate);
        query.set("endDate", endDate);
        query.set("sort", "desc");

        const data = await requestApi<ActivityLog[]>(`/api/records?${query.toString()}`);
        if (active) setRangeRecords(sortRecordsByRecent(data));
      } catch {
        // 静默失败
      } finally {
        if (active) setRangeLoading(false);
      }
    }

    void loadRangeRecords();
    return () => {
      active = false;
    };
  }, [recordsTimeRange]);

  const groupedResults = useMemo<SearchResultGroup[]>(() => {
    const groupMap = new Map<string, ActivityLog[]>();

    for (const record of records) {
      const currentRecords = groupMap.get(record.date) ?? [];
      currentRecords.push(record);
      groupMap.set(record.date, currentRecords);
    }

    return Array.from(groupMap.entries()).map(([date, groupedRecords]) => ({
      date,
      records: groupedRecords,
    }));
  }, [records]);

  /** 时间范围预设的分组记录 */
  const groupedRangeResults = useMemo<SearchResultGroup[]>(() => {
    const groupMap = new Map<string, ActivityLog[]>();
    for (const record of rangeRecords) {
      const currentRecords = groupMap.get(record.date) ?? [];
      currentRecords.push(record);
      groupMap.set(record.date, currentRecords);
    }
    return Array.from(groupMap.entries()).map(([date, groupedRecords]) => ({
      date,
      records: groupedRecords,
    }));
  }, [rangeRecords]);

  /** 高频标签整理：叠加 tag 详情以拿到 icon */
  const topTagsWithIcon = useMemo(() => {
    if (!summary) return [];
    return summary.topTags.map((tag) => {
      const fullTag = tags.find((t) => t.id === tag.tagId);
      return { ...tag, tagIcon: fullTag?.icon ?? tag.tagIcon ?? null };
    });
  }, [summary, tags]);

  const hasFilters = Boolean(filters.keyword || filters.tagId || filters.startDate || filters.endDate);
  const currentMonth = dayjs().format("YYYY-MM");

  const moveMonth = (direction: "prev" | "next") => {
    const nextMonth = dayjs(`${reviewMonth}-01`)[direction === "prev" ? "subtract" : "add"](1, "month");
    if (nextMonth.format("YYYY-MM") > currentMonth) {
      return;
    }
    setReviewMonth(nextMonth.format("YYYY-MM"));
  };

  const getTagLabel = (tagId?: string | null) => tags.find((tag) => tag.id === tagId);

  /** 标签统计页：按使用次数降序 */
  const tagStats = useMemo(() => {
    const enabledTags = tags.filter((t) => t.enabled);
    const countMap = new Map<string, number>();
    for (const record of records) {
      if (record.tagId) {
        countMap.set(record.tagId, (countMap.get(record.tagId) ?? 0) + 1);
      }
    }
    return enabledTags
      .map((tag) => ({ tag, count: countMap.get(tag.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [tags, records]);

  /** 格式化环比文案：正数 +N / 负数 N / 持平 0 */
  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return "0";
  };

  /** 数据卡（记录总数 / 记录天数） */
  const SummaryStatCard = ({
    title,
    value,
    unit,
    delta,
    color,
  }: {
    title: string;
    value: number;
    unit: string;
    delta: number;
    color: string;
  }) => (
    <div className="rounded-[16px] bg-white p-4 shadow-[0_2px_10px_rgba(18,46,40,0.04)]">
      <p className="text-[13px] text-[#6B7A7A]">{title}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-numeric text-[30px] font-semibold leading-none" style={{ color }}>
          {value}
        </span>
        <span className="text-[14px] text-[#6B7A7A]">{unit}</span>
      </div>
      <p className="mt-2 text-[12px] text-[#8EA09B]">
        较上月{" "}
        <span className={cn("font-medium", delta > 0 ? "text-[#16967F]" : delta < 0 ? "text-[#E06060]" : "text-[#8EA09B]")}>
          {formatDelta(delta)}
        </span>
      </p>
    </div>
  );

  /** 月份选择器 */
  const MonthSelector = () => (
    <div className="mb-4 flex items-center justify-center gap-6 py-2 text-[#6B7A7A]">
      <button
        type="button"
        onClick={() => moveMonth("prev")}
        className="flex h-7 w-7 items-center justify-center rounded-full active:bg-[#E8F2EF]"
        aria-label="上一月"
      >
        <CaretLeft size={16} />
      </button>
      <p className="min-w-[112px] text-center text-[15px] font-medium text-[#1F2A2A]">
        {dayjs(`${reviewMonth}-01`).format("YYYY年M月")}
      </p>
      <button
        type="button"
        onClick={() => moveMonth("next")}
        disabled={reviewMonth === currentMonth}
        className="flex h-7 w-7 items-center justify-center rounded-full active:bg-[#E8F2EF] disabled:opacity-40"
        aria-label="下一月"
      >
        <CaretRight size={16} />
      </button>
    </div>
  );

  /** 顶部三栏 Tabs */
  const TabSwitcher = () => (
    <div className="mb-4 flex items-center gap-6 border-b border-[#EEF4F2]">
      {([
        { key: "summary" as const, label: "月度回顾" },
        { key: "records" as const, label: "全部记录" },
        { key: "tags" as const, label: "标签统计" },
      ]).map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setViewMode(key)}
          className={cn(
            "relative pb-3 text-[15px] font-medium transition-colors",
            viewMode === key ? "text-[#1F2A2A]" : "text-[#A8B8B0]",
          )}
        >
          {label}
          {viewMode === key ? (
            <span className="absolute -bottom-px left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-[#22C3A6]" />
          ) : null}
        </button>
      ))}
    </div>
  );

  /** 横向最近记录行（参考图风格） */
  const RecentRecordRow = ({ record }: { record: ActivityLog }) => {
    const time = record.startTime ?? "—";
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="w-[78px] shrink-0 text-[12px] text-[#8EA09B]">
          <p>{dayjs(record.date).format("M月D日")}</p>
          <p className="mt-0.5 font-numeric tabular-nums">{time}</p>
        </div>
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#1F2A2A]">
          {record.title}
        </p>
        {record.tag ? <TagBadge label={record.tag.name} color={record.tag.color} compact /> : null}
      </div>
    );
  };

  /** 记录卡片小件（复用于全部记录） */
  const RecordCard = ({ record }: { record: ActivityLog }) => (
    <div className="flex items-start justify-between gap-3 rounded-[14px] bg-[#F7FAF9] px-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#8EA09B]">
          {dayjs(record.date).format("M月D日")}
          {record.startTime ? ` · ${record.startTime}` : null}
        </p>
        <p className="mt-1 text-[14px] font-medium text-[#1F2A2A]">{record.title}</p>
      </div>
      {record.tag ? <TagBadge label={record.tag.name} color={record.tag.color} compact /> : null}
    </div>
  );

  /** 日期分组的记录区块（复用，全部记录列表用） */
  const RecordGroup = ({ group }: { group: SearchResultGroup }) => (
    <SectionCard key={group.date}>
      <h3 className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#1F2A2A]">
        <CalendarBlank size={16} className="text-[#22C3A6]" />
        {dayjs(group.date).format("M月D日 dddd")}
      </h3>

      <div className="flex flex-col gap-2">
        {group.records.map((record) => (
          <div key={record.id} className="flex items-center gap-3 rounded-[12px] bg-[#F7FAF9] px-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[#1F2A2A]">{record.title}</p>
              {record.startTime ? (
                <p className="mt-0.5 text-[12px] text-[#8EA09B]">{record.startTime}</p>
              ) : null}
              {record.note ? (
                <p className={cn("text-[12px] text-[#8EA09B]", record.startTime ? "mt-0.5" : "mt-1")}>
                  {record.note}
                </p>
              ) : null}
            </div>
            {record.tag ? (
              <TagBadge label={record.tag.name} color={record.tag.color} compact />
            ) : (
              <span className="text-[11px] text-[#A8B8B0]">未分类</span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">回顾</h1>
          <p className="mt-1 text-[13px] text-[#8C9A97]">回顾过去，遇见成长</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B7A7A] active:bg-[#E8F2EF]"
            aria-label="搜索"
          >
            <MagnifyingGlass size={20} />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B7A7A] active:bg-[#E8F2EF]"
            aria-label="筛选"
          >
            <FadersHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-gutter:stable]">
        {notice ? <StateBanner tone="error" message={notice} className="mb-4" /> : null}

        <TabSwitcher />

        {/* 月份选择器（仅月度回顾与标签统计显示） */}
        {viewMode === "summary" || viewMode === "tags" ? <MonthSelector /> : null}

        {/* 全部记录时间范围切换 */}
        {viewMode === "records" ? (
          <div className="mb-4 flex items-center rounded-[12px] bg-[#E8F2EF] p-1">
            {([
              { key: "month" as const, label: "按月" },
              { key: "3months" as const, label: "3个月" },
              { key: "6months" as const, label: "6个月" },
              { key: "year" as const, label: "本年" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRecordsTimeRange(key)}
                className={cn(
                  "flex-1 rounded-[10px] px-2 py-2 text-[13px] font-medium transition-all duration-200",
                  recordsTimeRange === key
                    ? "bg-white text-[#16967F] shadow-[0_2px_8px_rgba(18,46,40,0.08)]"
                    : "text-[#6B7A7A]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {hasFilters ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[16px] bg-[#F2FBFA] px-3 py-3">
            <span className="text-[12px] font-medium text-[#16967F]">当前筛选</span>
            {filters.keyword ? (
              <span className="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
                {filters.keyword}
              </span>
            ) : null}
            {filters.tagId ? (
              <span className="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
                {getTagLabel(filters.tagId)?.name ?? "标签"}
              </span>
            ) : null}
            {filters.startDate ? (
              <span className="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
                {filters.startDate} 起
              </span>
            ) : null}
            {filters.endDate ? (
              <span className="rounded-full bg-white px-3 py-1 text-[12px] text-[#1F2A2A]">
                至 {filters.endDate}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setFilters({})}
              className="ml-auto text-[12px] font-semibold text-[#16967F]"
            >
              清除
            </button>
          </div>
        ) : null}

        {loading ? (
          <SectionCard className="h-[240px] animate-pulse bg-white/70" />
        ) : viewMode === "summary" && summary ? (
          <div className="flex flex-col gap-4">
            {/* 记录总数 / 记录天数 两栏卡片（含较上月） */}
            <div className="grid grid-cols-2 gap-3">
              <SummaryStatCard
                title="记录总数"
                value={summary.totalRecords}
                unit="条"
                delta={summary.totalRecordsDelta}
                color="#22C3A6"
              />
              <SummaryStatCard
                title="记录天数"
                value={summary.recordDays}
                unit="天"
                delta={summary.recordDaysDelta}
                color="#5DA9E9"
              />
            </div>

            {/* 高频标签 Top 5 */}
            <SectionCard>
              <h3 className="mb-4 text-[15px] font-semibold text-[#1F2A2A]">
                高频标签 <span className="text-[#A8B8B0]">Top {topTagsWithIcon.length || 5}</span>
              </h3>
              {topTagsWithIcon.length === 0 ? (
                <p className="text-[13px] text-[#8EA09B]">本月还没有带标签的记录。</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {topTagsWithIcon.map((tag) => {
                    const hasIcon = Boolean(tag.tagIcon);
                    return (
                    <div
                      key={tag.tagId}
                      className={cn(
                        "grid items-center gap-3",
                        hasIcon
                          ? "grid-cols-[2.25rem_5rem_1fr_2rem]"
                          : "grid-cols-[5rem_1fr_2rem]",
                      )}
                    >
                      {hasIcon ? (
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[16px]"
                          style={{ backgroundColor: `${tag.tagColor}26` }}
                          aria-hidden="true"
                        >
                          {tag.tagIcon}
                        </span>
                      ) : null}
                      <span className="truncate text-[13px] font-medium text-[#1F2A2A]">
                        {tag.tagName}
                      </span>
                      <div className="h-2 rounded-full bg-[#EEF4F2]">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(
                              (tag.count / Math.max(topTagsWithIcon[0]?.count ?? 1, 1)) * 100,
                              18,
                            )}%`,
                            backgroundColor: tag.tagColor,
                          }}
                        />
                      </div>
                      <span className="text-right font-numeric text-[13px] font-medium text-[#6B7A7A]">
                        {tag.count}
                      </span>
                    </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* 最近记录（横向行布局） */}
            <SectionCard>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[#1F2A2A]">最近记录</h3>
                <button
                  type="button"
                  onClick={() => setViewMode("records")}
                  className="flex items-center gap-0.5 text-[12px] font-medium text-[#16967F]"
                >
                  查看更多
                  <ArrowRight size={12} weight="bold" />
                </button>
              </div>
              {summary.recentRecords.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-[#8EA09B]">这个月暂时还没有内容。</p>
              ) : (
                <div className="divide-y divide-[#EEF4F2]">
                  {summary.recentRecords.slice(0, 5).map((record) => (
                    <RecentRecordRow key={record.id} record={record} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : viewMode === "tags" ? (
          /* 标签统计：按使用次数降序 */
          tagStats.length === 0 ? (
            <EmptyState
              icon={<CalendarBlank size={26} />}
              title="还没有可用标签"
              description="前往「标签」页面创建并启用标签后，会在这里汇总使用情况。"
            />
          ) : (
            <SectionCard>
              <div className="flex flex-col divide-y divide-[#EEF4F2]">
                {tagStats.map(({ tag, count }) => {
                  const hasIcon = Boolean(tag.icon);
                  return (
                  <div key={tag.id} className="flex items-center gap-3 py-3">
                    {hasIcon ? (
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[16px]"
                        style={{ backgroundColor: `${tag.color}26` }}
                        aria-hidden="true"
                      >
                        {tag.icon}
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#1F2A2A]">{tag.name}</p>
                      <p className="mt-0.5 text-[12px] text-[#8EA09B]">
                        本月 {count} 次 · 累计 {count} 次
                      </p>
                    </div>
                    <span className="font-numeric text-[18px] font-semibold text-[#1F2A2A]">
                      {count}
                    </span>
                  </div>
                );
                })}
              </div>
            </SectionCard>
          )
        ) : recordsTimeRange !== "month" ? (
          /* 时间范围预设模式 */
          rangeLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SectionCard key={i} className="h-[120px] animate-pulse bg-white/60" />
              ))}
            </div>
          ) : groupedRangeResults.length === 0 ? (
            <EmptyState
              icon={<CalendarBlank size={26} />}
              title="没有找到符合条件的记录"
              description="当前时间范围内还没有记录。"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {groupedRangeResults.map((group) => (
                <RecordGroup key={group.date} group={group} />
              ))}
            </div>
          )
        ) : groupedResults.length === 0 ? (
          <EmptyState
            icon={<CalendarBlank size={26} />}
            title="没有找到符合条件的记录"
            description="可以放宽关键词、日期范围或标签条件再试一次。"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {groupedResults.map((group) => (
              <RecordGroup key={group.date} group={group} />
            ))}
          </div>
        )}
      </div>

      <SearchFilterSheet
        key={`search-filter-${showFilters ? JSON.stringify(filters) : "closed"}`}
        open={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setViewMode("records");
        }}
        tags={tags}
        initialFilters={filters}
      />
    </div>
  );
}
