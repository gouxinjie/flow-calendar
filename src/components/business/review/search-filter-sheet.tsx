"use client";

/**
 * @component SearchFilterSheet
 * @description 搜索与筛选弹层
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import { useState } from "react";

import { BottomSheet } from "@/components/business/shared/bottom-sheet";
import { DateRangePicker } from "@/components/commons/date-range-picker";
import { getNeutralButtonStyle, getTagButtonStyle } from "@/lib/tag-color";
import type { ActivityTag, SearchFilters } from "@/types/models";

interface SearchFilterSheetProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  tags: ActivityTag[];
  initialFilters: SearchFilters;
}

export function SearchFilterSheet({
  open,
  onClose,
  onApply,
  tags,
  initialFilters,
}: SearchFilterSheetProps) {
  const [keyword, setKeyword] = useState(initialFilters.keyword ?? "");
  const [tagId, setTagId] = useState<string | undefined>(initialFilters.tagId);
  const [startDate, setStartDate] = useState(initialFilters.startDate ?? "");
  const [endDate, setEndDate] = useState(initialFilters.endDate ?? "");
  const [includeUncategorized, setIncludeUncategorized] = useState(
    initialFilters.includeUncategorized ?? true,
  );

  const handleApply = () => {
    onApply({
      keyword: keyword.trim() || undefined,
      tagId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      includeUncategorized,
    });
    onClose();
  };

  const handleReset = () => {
    setKeyword("");
    setTagId(undefined);
    setStartDate("");
    setEndDate("");
    setIncludeUncategorized(true);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="搜索与筛选"
      footer={
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#DCEAD2] text-[14px] font-medium text-[#6B7A7A] active:bg-[#F4F9F1]"
          >
            重置
          </button>
          <button
            onClick={handleApply}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#5EBF3F] text-[14px] font-semibold text-white active:opacity-80"
          >
            应用筛选
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            关键词
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索标题或备注…"
            className="w-full rounded-[14px] border border-[#DCEAD2] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none focus:border-[#5EBF3F]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            标签筛选
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagId(undefined)}
              className="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
              style={getNeutralButtonStyle(!tagId)}
            >
              全部
            </button>
            {tags
              .filter((t) => t.enabled)
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagId(tag.id)}
                  className="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
                  style={getTagButtonStyle(tag.color, tagId === tag.id)}
                >
                  {tag.name}
                </button>
              ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            日期范围
          </label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 active:opacity-80">
          <div className="relative h-5 w-5 shrink-0">
            <input
              type="checkbox"
              checked={includeUncategorized}
              onChange={(e) => setIncludeUncategorized(e.target.checked)}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-[6px] border border-[#DCEAD2] bg-white transition-all duration-200 peer-checked:border-[#5EBF3F] peer-checked:bg-[#5EBF3F]"></span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 text-white transition-transform duration-200 peer-checked:scale-100"
            >
              <path d="M2 6L5 9L10 3" />
            </svg>
          </div>
          <span className="text-[14px] text-[#1F2A2A]">包含未分类记录</span>
        </label>
      </div>
    </BottomSheet>
  );
}
