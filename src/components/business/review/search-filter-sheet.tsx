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
import { cn } from "@/lib/cn";
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
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#DCE7E4] text-[14px] font-medium text-[#6B7A7A] active:bg-[#F3F7F6]"
          >
            重置
          </button>
          <button
            onClick={handleApply}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#169968] text-[14px] font-semibold text-white active:opacity-80"
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
            className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#169968]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            标签筛选
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagId(undefined)}
              className={cn(
                "rounded-[10px] px-3 py-1.5 text-[13px] font-medium",
                !tagId ? "bg-[#1F2A2A] text-white" : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              全部
            </button>
            {tags
              .filter((t) => t.enabled)
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagId(tag.id)}
                  className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: tagId === tag.id ? tag.color : `${tag.color}18`,
                    color: tagId === tag.id ? "#FFFFFF" : tag.color,
                  }}
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
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-[14px] border border-[#DCE7E4] px-3 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#169968]"
              placeholder="开始日期"
            />
            <span className="text-[#A8B8B0]">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 rounded-[14px] border border-[#DCE7E4] px-3 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#169968]"
              placeholder="结束日期"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={includeUncategorized}
            onChange={(e) => setIncludeUncategorized(e.target.checked)}
            className="h-5 w-5 rounded accent-[#169968]"
          />
          <span className="text-[14px] text-[#1F2A2A]">包含未分类记录</span>
        </label>
      </div>
    </BottomSheet>
  );
}
