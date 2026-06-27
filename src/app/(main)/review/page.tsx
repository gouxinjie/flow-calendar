"use client";

/**
 * @page ReviewPage
 * @description 回顾页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useMemo, useState } from "react";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  FadersHorizontal,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import dayjs from "dayjs";

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

export default function ReviewPage() {
  const [viewMode, setViewMode] = useState<"summary" | "records">("summary");
  const [reviewMonth, setReviewMonth] = useState(dayjs().format("YYYY-MM"));
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [records, setRecords] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<MonthReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

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

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">回顾</h1>
        <p className="mt-1 text-[13px] text-[#8C9A97]">回顾过去，遇见成长</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {notice ? <StateBanner tone="error" message={notice} className="mb-4" /> : null}

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex flex-1 items-center gap-2 rounded-[16px] border border-[#DCE7E4] bg-white px-4 py-3 text-[14px] text-[#8EA09B]"
          >
            <MagnifyingGlass size={18} />
            <span>搜索标题或备注</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="flex h-[48px] w-[48px] items-center justify-center rounded-[16px] border border-[#DCE7E4] bg-white text-[#6B7A7A]"
          >
            <FadersHorizontal size={20} />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-[18px] bg-white/78 p-1">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`flex-1 rounded-[14px] px-3 py-2 text-[14px] font-medium ${
              viewMode === "summary" ? "bg-[#F2FBFA] text-[#16967F]" : "text-[#6B7A7A]"
            }`}
          >
            月度回顾
          </button>
          <button
            type="button"
            onClick={() => setViewMode("records")}
            className={`flex-1 rounded-[14px] px-3 py-2 text-[14px] font-medium ${
              viewMode === "records" ? "bg-[#F2FBFA] text-[#16967F]" : "text-[#6B7A7A]"
            }`}
          >
            全部记录
          </button>
        </div>

        <SectionCard className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => moveMonth("prev")} className="rounded-full p-2 text-[#6B7A7A]">
            <CaretLeft size={18} />
          </button>
          <p className="text-[16px] font-semibold text-[#1F2A2A]">
            {dayjs(`${reviewMonth}-01`).format("YYYY年M月")}
          </p>
          <button
            type="button"
            onClick={() => moveMonth("next")}
            disabled={reviewMonth === currentMonth}
            className="rounded-full p-2 text-[#6B7A7A] disabled:opacity-40"
          >
            <CaretRight size={18} />
          </button>
        </SectionCard>

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
            <SectionCard>
              <h3 className="mb-4 text-[16px] font-semibold text-[#1F2A2A]">
                {summary.year}年 {summary.month} 月回顾
              </h3>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-[16px] bg-[#F7FAF9] p-4 text-center">
                  <p className="font-numeric text-[30px] font-semibold text-[#22C3A6]">{summary.totalRecords}</p>
                  <p className="mt-1 text-[12px] text-[#6B7A7A]">记录总数</p>
                </div>
                <div className="rounded-[16px] bg-[#F7FAF9] p-4 text-center">
                  <p className="font-numeric text-[30px] font-semibold text-[#5DA9E9]">{summary.recordDays}</p>
                  <p className="mt-1 text-[12px] text-[#6B7A7A]">记录天数</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[13px] font-medium text-[#6B7A7A]">高频标签 Top {summary.topTags.length || 0}</p>
                {summary.topTags.length === 0 ? (
                  <p className="text-[13px] text-[#8EA09B]">本月还没有带标签的记录。</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {summary.topTags.map((tag) => (
                      <div key={tag.tagId} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3">
                        <span className="text-[13px] font-medium text-[#1F2A2A]">{tag.tagName}</span>
                        <div className="h-2 rounded-full bg-[#EEF4F2]">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max((tag.count / Math.max(summary.topTags[0]?.count ?? 1, 1)) * 100, 18)}%`,
                              backgroundColor: tag.tagColor,
                            }}
                          />
                        </div>
                        <span className="text-right text-[12px] font-medium text-[#6B7A7A]">{tag.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-3 text-[16px] font-semibold text-[#1F2A2A]">最近记录</h3>
              {summary.recentRecords.length === 0 ? (
                <p className="text-[13px] text-[#8EA09B]">这个月暂时还没有内容。</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {summary.recentRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-start justify-between gap-3 rounded-[14px] bg-[#F7FAF9] px-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-[#8EA09B]">
                          {dayjs(record.date).format("M月D日")}
                        </p>
                        <p className="mt-1 text-[14px] font-medium text-[#1F2A2A]">{record.title}</p>
                      </div>
                      {record.tag ? <TagBadge label={record.tag.name} color={record.tag.color} compact /> : null}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : groupedResults.length === 0 ? (
          <EmptyState
            icon={<CalendarBlank size={26} />}
            title="没有找到符合条件的记录"
            description="可以放宽关键词、日期范围或标签条件再试一次。"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {groupedResults.map((group) => (
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
                        {record.note ? (
                          <p className="mt-1 text-[12px] text-[#8EA09B]">{record.note}</p>
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
